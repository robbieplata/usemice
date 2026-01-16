import { Device, type CapabilityKey, isCapableOf, type ReadyDevice, type FailedDevice } from './device'
import { RAZER_VID, SUPPORTED_DEVICE_INFO } from './devices'
import type { DeviceInfo } from './builder'
import { RAZER_REPORT_ID, RazerReport } from './report'
import { DEVICE_COMMANDS } from './commands'

export class OpenHidDeviceError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

export class RequestHidDeviceError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

export class DeviceNotSupportedError extends Error {
  constructor(readonly vid: number, readonly pid: number) {
    super(`Device not supported: VID=${vid.toString(16)}, PID=${pid.toString(16)}`)
  }
}

export class DeviceInitializationError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

const _delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const _send = async (hid: HIDDevice, report: RazerReport): Promise<void> => {
  if (!hid.opened) {
    throw new OpenHidDeviceError('Device is not opened')
  }
  await hid.sendFeatureReport(RAZER_REPORT_ID, report.buffer)
}

const _receive = async (hid: HIDDevice): Promise<Uint8Array> => {
  if (!hid.opened) {
    throw new OpenHidDeviceError('Device is not opened')
  }
  const view = await hid.receiveFeatureReport(RAZER_REPORT_ID)
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
}

export const retrieveHidDevice = async (options?: HIDDeviceRequestOptions): Promise<HIDDevice> => {
  const [device] = await navigator.hid.requestDevice(options ?? { filters: [{ vendorId: RAZER_VID }] })
  if (!device) {
    throw new RequestHidDeviceError('No device selected')
  }

  const allDevices = await navigator.hid.getDevices()
  const sameProduct = allDevices.filter((d) => d.vendorId === device.vendorId && d.productId === device.productId)

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
  return device
}

export const identifyDevice = (hid: HIDDevice): DeviceInfo<CapabilityKey> | undefined => {
  for (const info of SUPPORTED_DEVICE_INFO) {
    if (info.vid === hid.vendorId && info.pid === hid.productId) {
      return info
    }
  }
}

const createDevice = async (
  deviceInfo: DeviceInfo<CapabilityKey>,
  hid: HIDDevice
): Promise<ReadyDevice | FailedDevice> => {
  const device = new Device(deviceInfo, hid)
  const fetchCommands: Promise<unknown>[] = []
  for (const cap of Object.keys(device.supportedCapabilities) as CapabilityKey[]) {
    if (isCapableOf(device, [cap])) fetchCommands.push(DEVICE_COMMANDS[cap].fetch(device))
  }
  return await Promise.all(fetchCommands)
    .then(() => {
      device.status = 'Ready'
      return device as ReadyDevice
    })
    .catch(() => {
      device.status = 'Failed'
      return device as FailedDevice
    })
}

export const connectDevice = async (options?: HIDDeviceRequestOptions): Promise<ReadyDevice | FailedDevice> => {
  console.log('Requesting device...')
  const hid = await retrieveHidDevice(options ?? { filters: [{ vendorId: RAZER_VID }] })
  if (!hid.opened) {
    await hid.open()
  }
  const deviceInfo = identifyDevice(hid)

  if (!deviceInfo) {
    throw new DeviceNotSupportedError(hid.vendorId, hid.productId)
  }
  return await createDevice(deviceInfo, hid)
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

export const sendReport = async (device: Device, report: RazerReport, maxRetries = 10): Promise<RazerReport> => {
  return device._lock.withLock(async () => {
    const txId = getNextTxId(device._txId)
    report.transactionId = txId
    const expectedTxId = txId
    const expectedCommandClass = report.commandClass
    const expectedCommandId = report.commandId

    await _send(device.hid, report)
    await _delay(10)

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const response = RazerReport.fromBytes(await _receive(device.hid))
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
          throw new OpenHidDeviceError('Device returned failure status')
        case RAZER_STATUS.TIMEOUT:
          throw new OpenHidDeviceError('Device returned timeout status')
        case RAZER_STATUS.NOT_SUPPORTED:
          throw new OpenHidDeviceError('Command not supported by device')
        default:
          console.log(`Unknown status 0x${status.toString(16)}, retry ${attempt + 1}/${maxRetries}...`)
          await _delay(20)
          continue
      }
    }
    throw new OpenHidDeviceError('Max retries exceeded waiting for device response')
  })
}
