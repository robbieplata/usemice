import { runInAction } from 'mobx'
import { Device, type CapabilityKey, isCapableOf } from './device'
import { RAZER_VID, SUPPORTED_DEVICE_INFO } from './devices'
import type { DeviceInfo } from './builder'
import { RazerReport } from './report'
import { DEVICE_COMMANDS } from './commands'

export const RAZER_REPORT_SIZE = 90
export const RAZER_REPORT_ID = 0x00

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

export const requestDevice = async (options?: HIDDeviceRequestOptions): Promise<HIDDevice> => {
  const [device] = await navigator.hid.requestDevice(options ?? { filters: [{ vendorId: RAZER_VID }] })
  if (!device) throw new RequestHidDeviceError('No device selected')

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
  return undefined
}

const syncDevice = async (device: Device): Promise<void> => {
  const tasks: Promise<unknown>[] = []
  for (const cap of Object.keys(device.supportedCapabilities) as CapabilityKey[]) {
    if (isCapableOf(device, [cap])) tasks.push(DEVICE_COMMANDS[cap].fetch(device))
  }
  await Promise.all(tasks)
}

export const openDevice = async (hid: HIDDevice): Promise<HIDDevice> => {
  if (!hid.opened) {
    await hid.open()
  }
  return hid
}

export const connectDevice = async (options?: HIDDeviceRequestOptions): Promise<Device> => {
  console.log('Requesting device...')
  const hid = await requestDevice(options ?? { filters: [{ vendorId: RAZER_VID }] })

  await openDevice(hid)

  const deviceInfo = identifyDevice(hid)

  if (!deviceInfo) {
    throw new DeviceNotSupportedError(hid.vendorId, hid.productId)
  }

  const device = new Device({
    name: deviceInfo.name,
    hid,
    supportedCapabilities: deviceInfo.supportedCapabilities,
    limits: deviceInfo.limits
  })

  try {
    await syncDevice(device)
    runInAction(() => {
      device.status = 'Ready'
    })
  } catch (error) {
    runInAction(() => {
      device.status = 'Failed'
      device.error = error instanceof Error ? error : new Error(String(error))
    })
  }

  return device
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const sendInternal = async (hid: HIDDevice, report: RazerReport): Promise<void> => {
  if (!hid.opened) throw new OpenHidDeviceError('Device is not opened')
  await hid.sendFeatureReport(RAZER_REPORT_ID, report.buffer)
}

const receiveInternal = async (hid: HIDDevice): Promise<Uint8Array> => {
  if (!hid.opened) throw new OpenHidDeviceError('Device is not opened')
  const view = await hid.receiveFeatureReport(RAZER_REPORT_ID)
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
}

const RAZER_STATUS = {
  NEW: 0x00,
  BUSY: 0x01,
  SUCCESS: 0x02,
  FAILURE: 0x03,
  TIMEOUT: 0x04,
  NOT_SUPPORTED: 0x05
} as const

const getNextTxId = (txId: { value: number }): number => {
  const current = txId.value
  txId.value = (current % 255) + 1
  return current
}

export const sendCommand = async (device: Device, report: RazerReport, maxRetries = 10): Promise<RazerReport> => {
  return device._lock.withLock(async () => {
    const txId = getNextTxId(device._txId)
    report.transactionId = txId
    const expectedTxId = txId
    const expectedCommandClass = report.commandClass
    const expectedCommandId = report.commandId

    await sendInternal(device.hid, report)
    await delay(10)

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const response = RazerReport.fromBytes(await receiveInternal(device.hid))
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
        await delay(10)
        continue
      }

      if (responseTxId !== expectedTxId) {
        console.warn(
          `Stale report (tx: 0x${responseTxId.toString(16)}, expected: 0x${expectedTxId.toString(16)}), retry ${
            attempt + 1
          }/${maxRetries}`
        )
        await delay(10)
        continue
      }

      switch (status) {
        case RAZER_STATUS.SUCCESS:
          return response
        case RAZER_STATUS.BUSY:
          console.warn(`Device busy, retry ${attempt + 1}/${maxRetries}...`)
          await delay(20)
          continue
        case RAZER_STATUS.FAILURE:
          throw new OpenHidDeviceError('Device returned failure status')
        case RAZER_STATUS.TIMEOUT:
          throw new OpenHidDeviceError('Device returned timeout status')
        case RAZER_STATUS.NOT_SUPPORTED:
          throw new OpenHidDeviceError('Command not supported by device')
        default:
          console.log(`Unknown status 0x${status.toString(16)}, retry ${attempt + 1}/${maxRetries}...`)
          await delay(20)
          continue
      }
    }
    throw new OpenHidDeviceError('Max retries exceeded waiting for device response')
  })
}
