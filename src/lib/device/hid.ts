import { Console, Effect } from 'effect'
import { capabilityInitializers } from '../capabilities'
import type { PendingDevice, Device, ReadyDevice, FailedDevice } from './device'
import { SUPPORTED_DEVICE_INFO, type SupportedDeviceInfo } from './supported'
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
      const devices = await navigator.hid.requestDevice(options ?? { filters: [{ vendorId: RAZER_VID }] })
      const device = devices[0]
      if (!device) throw new RequestHidDeviceError('No device selected')

      const allDevices = await navigator.hid.getDevices()
      const sameProduct = allDevices.filter((d) => d.vendorId === device.vendorId && d.productId === device.productId)

      const configInterface = sameProduct.find((d) =>
        d.collections.some((c) => c.featureReports && c.featureReports.length > 0)
      )

      if (configInterface) {
        Console.log('Found configuration interface with feature reports')
        return configInterface
      }

      const vendorInterface = sameProduct.find((d) => d.collections.some((c) => c.usagePage === 0xff00))

      if (vendorInterface) {
        Console.log('Found vendor-specific interface (usagePage 0xFF00)')
        return vendorInterface
      }

      Console.warn('No interface with feature reports found, using selected device')
      return device
    },
    catch: (cause) =>
      cause instanceof RequestHidDeviceError ? cause : new RequestHidDeviceError('Failed to request HID device', cause)
  })

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

export const identifyDevice = (hid: HIDDevice): Effect.Effect<SupportedDeviceInfo, DeviceNotSupportedError> =>
  Effect.gen(function* () {
    const vid = hid.vendorId
    const pid = hid.productId

    for (const device of SUPPORTED_DEVICE_INFO) {
      if (device.vid === vid && device.pid === pid) {
        return yield* Effect.succeed(device)
      }
    }

    return yield* Effect.fail(new DeviceNotSupportedError(vid, pid))
  })

export const hydrateDevice = (device: Device): Effect.Effect<ReadyDevice | FailedDevice, DeviceInitializationError> =>
  Effect.gen(function* () {
    const errors: Error[] = []

    for (const capability of Object.keys(device.capabilities) as Array<keyof typeof device.capabilities>) {
      if (device.capabilities[capability]) {
        const init = capabilityInitializers[capability]
        if (init) {
          yield* init(device).pipe(
            Effect.catchAll((e) => {
              Console.error(`${capability} init failed:`, e)
              errors.push(e)
              return Effect.void
            })
          )
        }
      }
    }
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
  Effect.tryPromise({
    try: async () => {
      if (hid.opened) return hid
      await hid.open()
      return hid
    },
    catch: (e) => new OpenHidDeviceError('Failed to open HID device', e)
  })

export const connectDevice = (
  options?: HIDDeviceRequestOptions
): Effect.Effect<PendingInitializationResult, DeviceNotSupportedError | Error> =>
  Effect.gen(function* () {
    Console.log('Requesting device...')
    const hid = yield* requestDevice(options ?? { filters: [{ vendorId: RAZER_VID }] })

    yield* openDevice(hid)

    const deviceInfo = yield* identifyDevice(hid)

    const pendingDevice: PendingDevice = {
      name: deviceInfo.name,
      hid,
      capabilities: deviceInfo.capabilities,
      data: {},
      status: 'Pending'
    }

    return {
      device: pendingDevice,
      initialize: () =>
        Effect.gen(function* () {
          const device = yield* hydrateDevice(pendingDevice)
          return { device }
        })
    }
  })

const delay = (ms: number) => Effect.promise(() => new Promise((resolve) => setTimeout(resolve, ms)))

export const sendFeatureReport = (hid: HIDDevice, report: RazerReport) =>
  Effect.tryPromise({
    try: async () => {
      if (!hid.opened) throw new OpenHidDeviceError('Device is not opened')
      Console.log('Sending feature report, size:', report.buffer.byteLength)
      Console.log('Report data:', report.args)
      await hid.sendFeatureReport(RAZER_REPORT_ID, report.buffer)
    },
    catch: (e) => new OpenHidDeviceError('Failed to send feature report', e)
  })

export const receiveFeatureReport = (hid: HIDDevice) =>
  Effect.tryPromise({
    try: async () => {
      if (!hid.opened) throw new OpenHidDeviceError('Device is not opened')
      const view = await hid.receiveFeatureReport(RAZER_REPORT_ID)
      Console.log('Received feature report, size:', view.byteLength)
      const data = new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
      Console.log('Response data:', data.slice(0, 16))
      return data
    },
    catch: (e) => new OpenHidDeviceError('Failed to receive feature report', e)
  })

const getTransactionId = (report: ArrayBuffer | Uint8Array): number => {
  const data = report instanceof Uint8Array ? report : new Uint8Array(report)
  return data[1]
}

const RAZER_STATUS = {
  NEW: 0x00,
  BUSY: 0x01,
  SUCCESS: 0x02,
  FAILURE: 0x03,
  TIMEOUT: 0x04,
  NOT_SUPPORTED: 0x05
} as const

export const sendAndReceive = (hid: HIDDevice, report: RazerReport, maxRetries = 10) =>
  Effect.gen(function* () {
    const expectedTxId = getTransactionId(report.buffer)
    yield* sendFeatureReport(hid, report)
    yield* delay(10)

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const response = yield* receiveFeatureReport(hid)
      const responseTxId = response[1]
      const status = response[0]

      if (responseTxId !== expectedTxId) {
        Console.warn(
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
          Console.warn(`Device busy, retry ${attempt + 1}/${maxRetries}...`)
          yield* delay(20)
          continue
        case RAZER_STATUS.FAILURE:
          return yield* Effect.fail(new OpenHidDeviceError('Device returned failure status'))
        case RAZER_STATUS.TIMEOUT:
          return yield* Effect.fail(new OpenHidDeviceError('Device returned timeout status'))
        case RAZER_STATUS.NOT_SUPPORTED:
          return yield* Effect.fail(new OpenHidDeviceError('Command not supported by device'))
        default:
          Console.log(`Unknown status 0x${status.toString(16)}, retry ${attempt + 1}/${maxRetries}...`)
          yield* delay(20)
          continue
      }
    }
    return yield* Effect.fail(new OpenHidDeviceError('Max retries exceeded waiting for device response'))
  })
