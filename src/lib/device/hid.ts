import { Console, Effect, Option, Ref } from 'effect'
import type { PendingDevice, Device, CapabilityKey, FailedDevice } from './device'
import { SUPPORTED_DEVICE_INFO } from './supported'
import type { DeviceDefinition } from './builder'
import { RazerReport } from './razer_report'

export const RAZER_REPORT_SIZE = 90
export const RAZER_VID = 0x1532
export const RAZER_REPORT_ID = 0x00

class OpenHidDeviceError extends Error {
  readonly _tag = 'OpenHidDeviceError'
  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

export class RequestHidDeviceError extends Error {
  readonly _tag = 'RequestHidDeviceError'
  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

export const requestDevice = (options?: HIDDeviceRequestOptions) =>
  Effect.tryPromise({
    try: async () => {
      const [device] = await navigator.hid.requestDevice(options ?? { filters: [{ vendorId: RAZER_VID }] })
      if (!device) throw new RequestHidDeviceError('No device selected')

      const allDevices = await navigator.hid.getDevices()
      const sameProduct = allDevices.filter((d) => d.vendorId === device.vendorId && d.productId === device.productId)

      const configInterface = sameProduct.find((d) => d.collections.some((c) => (c.featureReports?.length ?? 0) > 0))
      if (configInterface) return { device: configInterface, reason: 'featureReports' as const }

      const vendorInterface = sameProduct.find((d) => d.collections.some((c) => c.usagePage === 0xff00))
      if (vendorInterface) return { device: vendorInterface, reason: 'vendorUsagePage' as const }

      return { device, reason: 'selected' as const }
    },
    catch: (cause) =>
      cause instanceof RequestHidDeviceError ? cause : new RequestHidDeviceError('Failed to request HID device', cause)
  }).pipe(
    Effect.tap(({ reason }) => {
      switch (reason) {
        case 'featureReports':
          return Console.log('Found configuration interface with feature reports')
        case 'vendorUsagePage':
          return Console.log('Found vendor-specific interface (usagePage 0xFF00)')
        case 'selected':
          return Console.warn('No interface with feature reports found, using selected device')
      }
    }),
    Effect.map(({ device }) => device)
  )

export class DeviceNotSupportedError extends Error {
  readonly _tag = 'DeviceNotSupportedError'
  constructor(readonly vid: number, readonly pid: number) {
    super(`Device not supported: VID=${vid.toString(16)}, PID=${pid.toString(16)}`)
  }
}

export class DeviceInitializationError extends Error {
  readonly _tag = 'DeviceInitializationError'
  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

export const identifyDevice = (hid: HIDDevice) =>
  Effect.findFirst(SUPPORTED_DEVICE_INFO, (device) =>
    Effect.succeed(device.vid === hid.vendorId && device.pid === hid.productId)
  )

export const hydrateDevice = <T extends CapabilityKey>(device: Device, deviceInfo: DeviceDefinition<T>) =>
  Effect.gen(function* () {
    for (const init of deviceInfo.init) {
      yield* init(device)
    }

    device.capabilities = Object.fromEntries(
      Object.entries(deviceInfo.methodFactories).map(([key, factory]) => [key, factory(device)])
    )

    return { ...device, status: 'Ready' as const }
  })

export type InitializationResult = {
  device: Device
}

export type PendingInitializationResult = {
  device: PendingDevice
  initialize: () => Effect.Effect<InitializationResult, DeviceInitializationError>
}

export const openDevice = (hid: HIDDevice) =>
  hid.opened
    ? Effect.succeed(hid)
    : Effect.tryPromise({
        try: () => hid.open().then(() => hid),
        catch: (e) => new OpenHidDeviceError('Failed to open HID device', e)
      })

export const connectDevice = (options?: HIDDeviceRequestOptions) =>
  Effect.gen(function* () {
    yield* Console.log('Requesting device...')
    const hid = yield* requestDevice(options ?? { filters: [{ vendorId: RAZER_VID }] })

    yield* openDevice(hid)

    const deviceInfoOption = yield* identifyDevice(hid)

    if (Option.isNone(deviceInfoOption)) {
      return yield* Effect.fail(new DeviceNotSupportedError(hid.vendorId, hid.productId))
    }

    const lock = yield* Effect.makeSemaphore(1)
    const txId = yield* Ref.make(1)

    const pendingDevice: PendingDevice = {
      name: deviceInfoOption.value.name,
      status: 'Pending',
      hid,
      supportedCapabilities: deviceInfoOption.value.supportedCapabilities,
      limits: deviceInfoOption.value.limits,
      capabilityData: {},
      capabilities: {},
      _lock: lock,
      _txId: txId
    }

    const device = yield* hydrateDevice(pendingDevice, deviceInfoOption.value).pipe(
      Effect.map((device) => device),
      Effect.catchAll((error) =>
        Effect.succeed({
          ...pendingDevice,
          status: 'Failed',
          error
        } satisfies FailedDevice)
      )
    )
    return device
  })

const delay = (ms: number) => Effect.promise(() => new Promise((resolve) => setTimeout(resolve, ms)))

const sendInternal = (hid: HIDDevice, report: RazerReport) =>
  Effect.tryPromise({
    try: async () => {
      if (!hid.opened) throw new OpenHidDeviceError('Device is not opened')
      await hid.sendFeatureReport(RAZER_REPORT_ID, report.buffer)
    },
    catch: (e) => new OpenHidDeviceError('Failed to send feature report', e)
  })

const receiveInternal = (hid: HIDDevice) =>
  Effect.tryPromise({
    try: async () => {
      if (!hid.opened) throw new OpenHidDeviceError('Device is not opened')
      const view = await hid.receiveFeatureReport(RAZER_REPORT_ID)
      const data = new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
      return data
    },
    catch: (e) => new OpenHidDeviceError('Failed to receive feature report', e)
  })

const RAZER_STATUS = {
  NEW: 0x00,
  BUSY: 0x01,
  SUCCESS: 0x02,
  FAILURE: 0x03,
  TIMEOUT: 0x04,
  NOT_SUPPORTED: 0x05
} as const

const getNextTxId = (txIdRef: Ref.Ref<number>) => Ref.getAndUpdate(txIdRef, (id) => (id % 255) + 1)

export const sendCommand = (device: Device, report: RazerReport, maxRetries = 10) =>
  Effect.gen(function* () {
    return yield* device._lock.withPermits(1)(
      Effect.gen(function* () {
        const txId = yield* getNextTxId(device._txId)
        report.transactionId = txId
        const expectedTxId = txId

        yield* sendInternal(device.hid, report)
        yield* delay(10)

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          const response = yield* receiveInternal(device.hid)
          const responseTxId = response[1]
          const status = response[0]

          if (responseTxId !== expectedTxId) {
            yield* Console.warn(
              `Stale report (tx: 0x${responseTxId.toString(16)}, expected: 0x${expectedTxId.toString(16)}), retry ${
                attempt + 1
              }/${maxRetries}`
            )
            yield* delay(10)
            continue
          }

          switch (status) {
            case RAZER_STATUS.SUCCESS:
              return RazerReport.fromBytes(response)
            case RAZER_STATUS.BUSY:
              yield* Console.warn(`Device busy, retry ${attempt + 1}/${maxRetries}...`)
              yield* delay(20)
              continue
            case RAZER_STATUS.FAILURE:
              return yield* Effect.fail(new OpenHidDeviceError('Device returned failure status'))
            case RAZER_STATUS.TIMEOUT:
              return yield* Effect.fail(new OpenHidDeviceError('Device returned timeout status'))
            case RAZER_STATUS.NOT_SUPPORTED:
              return yield* Effect.fail(new OpenHidDeviceError('Command not supported by device'))
            default:
              yield* Console.log(`Unknown status 0x${status.toString(16)}, retry ${attempt + 1}/${maxRetries}...`)
              yield* delay(20)
              continue
          }
        }
        return yield* Effect.fail(new OpenHidDeviceError('Max retries exceeded waiting for device response'))
      })
    )
  })
