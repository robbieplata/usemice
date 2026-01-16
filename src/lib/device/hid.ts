import type { ReadyDevice, FailedDevice, SupportedCapabilities } from './device'
import { Device, isCapableOf } from './device'
import { RAZER_VID, SUPPORTED_DEVICE_INFO } from './devices'
import type { DeviceInfo } from './builder'
import { RAZER_REPORT_ID, RazerReport } from './report'
import { DEVICE_COMMANDS } from './commands'

type Result<T, E> = { value: T; error?: never } | { error: E }

export class OpenHidDeviceError {
  readonly name = 'OpenHidDeviceError'
  readonly message: string
  constructor(message: string, readonly cause?: unknown) {
    this.message = message
  }
}

export class RequestHidDeviceError {
  readonly name = 'RequestHidDeviceError'
  readonly message: string
  constructor(message: string) {
    this.message = message
  }
}

export class DeviceNotSupportedError {
  readonly name = 'DeviceNotSupportedError'
  readonly message: string
  constructor(readonly vid: number, readonly pid: number) {
    this.message = `Device not supported: VID=${vid.toString(16)}, PID=${pid.toString(16)}`
  }
}

export class DeviceInitializationError {
  readonly name = 'DeviceInitializationError'
  readonly message: string
  constructor(message: string) {
    this.message = message
  }
}

const _delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const _send = async (hid: HIDDevice, report: RazerReport): Promise<Result<undefined, OpenHidDeviceError>> => {
  if (!hid.opened) {
    return { error: new OpenHidDeviceError('Device is not opened') }
  }
  await hid.sendFeatureReport(RAZER_REPORT_ID, report.buffer)
  return { value: undefined }
}
const _receive = async (hid: HIDDevice): Promise<Result<Uint8Array, OpenHidDeviceError>> => {
  if (!hid.opened) {
    return { error: new OpenHidDeviceError('Device is not opened') }
  }
  const view = await hid.receiveFeatureReport(RAZER_REPORT_ID)
  return { value: new Uint8Array(view.buffer, view.byteOffset, view.byteLength) }
}

const selectBestInterface = (sameProduct: HIDDevice[], fallback: HIDDevice): HIDDevice => {
  const configInterface = sameProduct.find((d) => d.collections.some((c) => (c.featureReports?.length ?? 0) > 0))
  if (configInterface) {
    console.log('Found configuration interface with feature reports')
    return configInterface
  }

  const vendorInterface = sameProduct.find((d) => d.collections.some((c) => c.usagePage === 0xff00))
  if (vendorInterface) {
    console.log('Found vendor-specific interface (usagePage 0xFF00)')
    return vendorInterface
  }

  console.warn('No interface with feature reports found, using selected device')
  return fallback
}

export const retrieveHidDevice = async (
  options?: HIDDeviceRequestOptions
): Promise<Result<HIDDevice, RequestHidDeviceError>> => {
  const filters = options?.filters ?? [{ vendorId: RAZER_VID }]

  const existingDevices = await navigator.hid.getDevices()
  const matchingDevice = existingDevices.find((d) =>
    filters.some(
      (f) =>
        (f.vendorId === undefined || f.vendorId === d.vendorId) &&
        (f.productId === undefined || f.productId === d.productId)
    )
  )

  if (matchingDevice) {
    console.log('Using existing HID device')
    const sameProduct = existingDevices.filter(
      (d) => d.vendorId === matchingDevice.vendorId && d.productId === matchingDevice.productId
    )
    return { value: selectBestInterface(sameProduct, matchingDevice) }
  }

  const [device] = await navigator.hid.requestDevice(options ?? { filters })
  if (!device) {
    return { error: new RequestHidDeviceError('No device selected') }
  }

  const allDevices = await navigator.hid.getDevices()
  const sameProduct = allDevices.filter((d) => d.vendorId === device.vendorId && d.productId === device.productId)
  return { value: selectBestInterface(sameProduct, device) }
}

export const identifyDevice = (hid: HIDDevice): DeviceInfo | undefined => {
  for (const info of SUPPORTED_DEVICE_INFO) {
    if (info.vid === hid.vendorId && info.pid === hid.productId) {
      return info
    }
  }
}

const createDevice = async (
  deviceInfo: DeviceInfo,
  hid: HIDDevice
): Promise<Result<ReadyDevice | FailedDevice, Error>> => {
  const device = new Device(deviceInfo, hid)
  const supportedCapabilities = Object.keys(device.supportedCapabilities) as (keyof SupportedCapabilities)[]
  const fetchCommands = []
  for (const cap of supportedCapabilities) {
    if (isCapableOf(device, [cap])) {
      const fetchCommand = DEVICE_COMMANDS[cap].fetch(device)
      fetchCommands.push(fetchCommand)
    }
  }
  return await Promise.all(fetchCommands)
    .then(() => {
      device.status = 'Ready'
      return { value: device as ReadyDevice }
    })
    .catch(() => {
      device.status = 'Failed'
      return { value: device as FailedDevice }
    })
}

export const connectDevice = async (
  options?: HIDDeviceRequestOptions
): Promise<Result<ReadyDevice | FailedDevice, DeviceNotSupportedError | RequestHidDeviceError | Error>> => {
  console.log('Requesting device...')
  const hidResult = await retrieveHidDevice(options ?? { filters: [{ vendorId: RAZER_VID }] })
  if (hidResult.error) {
    return { error: hidResult.error }
  }
  const hid = hidResult.value

  if (!hid.opened) {
    await hid.open()
  }
  const deviceInfo = identifyDevice(hid)

  if (!deviceInfo) {
    return { error: new DeviceNotSupportedError(hid.vendorId, hid.productId) }
  }
  const deviceResult = await createDevice(deviceInfo, hid)
  if (deviceResult.error) {
    return { error: deviceResult.error }
  }

  return { value: deviceResult.value }
}

enum RAZER_STATUS {
  NEW = 0x00,
  BUSY = 0x01,
  SUCCESS = 0x02,
  FAILURE = 0x03,
  TIMEOUT = 0x04,
  NOT_SUPPORTED = 0x05
}

const getNextTxId = (txId: { value: number }): number => {
  const current = txId.value
  txId.value = (current % 255) + 1
  return current
}

class TransactionError extends Error {
  readonly name = 'TransactionError'
  constructor(message: string) {
    super(message)
  }
}

export const sendReport = async <D extends Device>(
  device: D,
  report: RazerReport,
  maxRetries = 10
): Promise<RazerReport> => {
  return device._lock.withLock(async () => {
    const txId = getNextTxId(device._txId)
    report.transactionId = txId
    const expectedTxId = txId
    const expectedCommandClass = report.commandClass
    const expectedCommandId = report.commandId

    await _send(device.hid, report)
    await _delay(10)

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const result = await _receive(device.hid)
      if (result.error) {
        throw result.error
      }
      const bytes = result.value
      const response = RazerReport.fromBytes(bytes)
      const responseTxId = response.transactionId
      const status = response.status
      const responseCommandClass = response.commandClass
      const responseCommandId = response.commandId

      if (responseCommandClass !== expectedCommandClass || responseCommandId !== expectedCommandId) {
        console.warn(
          `Mismatched command in response (class: 0x${responseCommandClass.toString(
            16
          )}, id: 0x${responseCommandId.toString(16)}), retry ${attempt + 1}/${maxRetries}`
        )
        await _delay(10)
        continue
      }

      if (responseTxId !== expectedTxId) {
        console.warn(
          `Stale report (tx: 0x${responseTxId.toString(16)}, expected: 0x${expectedTxId.toString(16)}), retry ${
            attempt + 1
          }/${maxRetries}`
        )
        await _delay(10)
        continue
      }

      switch (status) {
        case RAZER_STATUS.SUCCESS:
          return response
        case RAZER_STATUS.BUSY:
          console.warn(`Device busy, retry ${attempt + 1}/${maxRetries}...`)
          await _delay(20)
          continue
        case RAZER_STATUS.FAILURE:
          throw new TransactionError('Device returned failure status')
        case RAZER_STATUS.TIMEOUT:
          throw new TransactionError('Device returned timeout status')
        case RAZER_STATUS.NOT_SUPPORTED:
          throw new TransactionError('Command not supported by device')
        default:
          console.log(`Unknown status 0x${status.toString(16)}, retry ${attempt + 1}/${maxRetries}...`)
          await _delay(20)
          continue
      }
    }
    throw new TransactionError('Max retries exceeded waiting for device response')
  })
}
