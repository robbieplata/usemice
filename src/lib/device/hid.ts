import type { PendingDevice, Device, CapabilityKey, FailedDevice } from './device'
import { Mutex } from '../mutex'
import { SUPPORTED_DEVICE_INFO } from './supported'
import type { DeviceDefinition } from './builder'
import { RazerReport } from './razer_report'

export const RAZER_REPORT_SIZE = 90
export const RAZER_VID = 0x1532
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

export const identifyDevice = (hid: HIDDevice): DeviceDefinition<CapabilityKey> | undefined => {
  for (const device of SUPPORTED_DEVICE_INFO) {
    if (device.vid === hid.vendorId && device.pid === hid.productId) {
      return device
    }
  }
  return undefined
}

export const hydrateDevice = async <T extends CapabilityKey>(
  device: Device,
  deviceInfo: DeviceDefinition<T>
): Promise<Device> => {
  for (const init of deviceInfo.init) {
    await init(device)
  }

  device.capabilities = Object.fromEntries(
    Object.entries(deviceInfo.methodFactories).map(([key, factory]) => [key, factory(device)])
  )

  return { ...device, status: 'Ready' as const }
}

export const openDevice = async (hid: HIDDevice): Promise<HIDDevice> => {
  if (!hid.opened) {
    await hid.open()
  }
  return hid
}

export const connectDevice = async (options?: HIDDeviceRequestOptions): Promise<Device | FailedDevice> => {
  console.log('Requesting device...')
  const hid = await requestDevice(options ?? { filters: [{ vendorId: RAZER_VID }] })

  await openDevice(hid)

  const deviceInfo = identifyDevice(hid)

  if (!deviceInfo) {
    throw new DeviceNotSupportedError(hid.vendorId, hid.productId)
  }

  const pendingDevice: PendingDevice = {
    name: deviceInfo.name,
    status: 'Pending',
    hid,
    supportedCapabilities: deviceInfo.supportedCapabilities,
    limits: deviceInfo.limits,
    capabilityData: {},
    capabilities: {},
    _lock: new Mutex(),
    _txId: { value: 1 }
  }

  try {
    return await hydrateDevice(pendingDevice, deviceInfo)
  } catch (error) {
    return {
      ...pendingDevice,
      status: 'Failed',
      error: error instanceof Error ? error : new Error(String(error))
    } satisfies FailedDevice
  }
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

    await sendInternal(device.hid, report)
    await delay(10)

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const response = await receiveInternal(device.hid)
      const responseTxId = response[1]
      const status = response[0]

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
          return RazerReport.fromBytes(response)
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
