import { Device } from './device'
import { RAZER_VID, SUPPORTED_DEVICE_INFO } from './devices'
import type { DeviceInfo } from './builder'
import { RAZER_REPORT_ID, RazerReport } from './report'
import { find, groupBy, some } from 'lodash'
import { toast } from 'sonner'

type Result<T, E> = { value: T; error?: never } | { error: E }

export class OpenHidDeviceError extends Error {
  readonly name = 'OpenHidDeviceError'
  readonly message: string
  constructor(message: string) {
    super()
    this.message = message
  }
}

export class RequestHidDeviceError extends Error {
  readonly name = 'RequestHidDeviceError'
  constructor(message: string) {
    super(message)
  }
}

export class DeviceNotSupportedError extends Error {
  readonly name = 'DeviceNotSupportedError'
  constructor(
    readonly vid: number,
    readonly pid: number
  ) {
    super(`Device not supported: VID=${vid.toString(16)}, PID=${pid.toString(16)}`)
  }
}

export class DeviceInitializationError {
  readonly name = 'DeviceInitializationError'
  readonly message: string
  constructor(message: string) {
    this.message = message
  }
}

const _sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const _send = async (hidDevice: HIDDevice, report: RazerReport): Promise<Result<undefined, OpenHidDeviceError>> => {
  try {
    if (!hidDevice.opened) {
      return { error: new OpenHidDeviceError('Device is not opened') }
    }
    await hidDevice.sendFeatureReport(RAZER_REPORT_ID, report.buffer)
  } catch (e) {
    if (e instanceof Error) {
      return { error: new OpenHidDeviceError(`Failed to send report: ${e.message}`) }
    }
    return { error: new OpenHidDeviceError('Failed to send report: unknown error') }
  }
  return { value: undefined }
}
const _receive = async (hidDevice: HIDDevice): Promise<Result<Uint8Array, OpenHidDeviceError>> => {
  if (!hidDevice.opened) {
    return { error: new OpenHidDeviceError('Device is not opened') }
  }
  const view = await hidDevice.receiveFeatureReport(RAZER_REPORT_ID)
  return { value: new Uint8Array(view.buffer, view.byteOffset, view.byteLength) }
}

type HidProductKey = `${number}:${number}`

const productKey = (d: HIDDevice): HidProductKey => `${d.vendorId}:${d.productId}`

const matchesFilters = (d: HIDDevice, filters: HIDDeviceFilter[]) =>
  some(
    filters,
    (f) =>
      (f.vendorId === undefined || f.vendorId === d.vendorId) &&
      (f.productId === undefined || f.productId === d.productId)
  )
export const selectBestInterface = (sameProduct: HIDDevice[]): HIDDevice | undefined => {
  return (
    find(sameProduct, (dev) => dev.collections.some((c) => (c.featureReports?.length ?? 0) > 0)) ??
    find(sameProduct, (dev) => dev.collections.some((c) => c.usagePage === 0xff00))
  )
}

const pickBestInterfaces = (devices: HIDDevice[]): HIDDevice[] => {
  const groups = groupBy(devices, productKey)
  return Object.values(groups)
    .map(selectBestInterface)
    .filter((d): d is HIDDevice => d !== undefined)
}

const defaultFilters = (options?: HIDDeviceRequestOptions) => options?.filters ?? [{ vendorId: RAZER_VID }]

export const getHidInterfaces = async (options?: HIDDeviceRequestOptions): Promise<HIDDevice[]> => {
  const filters = defaultFilters(options)
  const all = await navigator.hid.getDevices()
  const matching = all.filter((d) => matchesFilters(d, filters))
  return pickBestInterfaces(matching)
}

export const requestHidInterface = async (
  options?: HIDDeviceRequestOptions
): Promise<Result<HIDDevice, RequestHidDeviceError>> => {
  const filters = defaultFilters(options)

  try {
    const reqOptions: HIDDeviceRequestOptions = { ...(options ?? {}), filters }
    const [requested] = await navigator.hid.requestDevice(reqOptions)
    if (!requested) {
      return { error: new RequestHidDeviceError('No device selected') }
    }
    const vid = requested.vendorId
    const pid = requested.productId
    const bestInterface = await navigator.hid.getDevices().then((devices) => {
      const sameProduct = devices.filter((d) => d.vendorId === vid && d.productId === pid)
      return selectBestInterface(sameProduct)
    })

    if (!bestInterface) {
      return { error: new RequestHidDeviceError('No compatible HID interface found') }
    }
    return { value: bestInterface }
  } catch {
    return { error: new RequestHidDeviceError('Failed to request HID device') }
  }
}

export const identifyDevice = (hid: HIDDevice): DeviceInfo | undefined => {
  for (const info of SUPPORTED_DEVICE_INFO) {
    if (info.vid === hid.vendorId && info.pid === hid.productId) {
      return info
    }
  }
}

enum RAZER_STATUS {
  NEW = 0x00,
  BUSY = 0x01,
  SUCCESS = 0x02,
  FAILURE = 0x03,
  TIMEOUT = 0x04,
  NOT_SUPPORTED = 0x05
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
    const expectedCommandClass = report.commandClass
    const expectedCommandId = report.commandId

    const result = await _send(device.hid, report)
    if (result.error) {
      throw result.error
    }

    await _sleep(20)

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const result = await _receive(device.hid)
      if (result.error) {
        console.warn(`Failed to receive report, retry ${attempt + 1}/${maxRetries}...`)
        throw result.error
      }
      const bytes = result.value
      const response = RazerReport.fromBytes(bytes)
      const status = response.status
      const responseCommandClass = response.commandClass
      const responseCommandId = response.commandId

      if (responseCommandClass !== expectedCommandClass || responseCommandId !== expectedCommandId) {
        console.warn(
          `Mismatched command in response (class: 0x${responseCommandClass.toString(
            16
          )}, id: 0x${responseCommandId.toString(16)}), retry ${attempt + 1}/${maxRetries}`
        )
        await _sleep(10)
        continue
      }

      switch (status) {
        case RAZER_STATUS.SUCCESS:
          return response
        case RAZER_STATUS.BUSY:
          console.warn(`Device busy, retry ${attempt + 1}/${maxRetries}...`)
          await _sleep(20)
          continue
        case RAZER_STATUS.FAILURE:
          toast('Device returned failure status')
          throw new TransactionError('Device returned failure status')
        case RAZER_STATUS.TIMEOUT:
          throw new TransactionError('Device returned timeout status')
        case RAZER_STATUS.NOT_SUPPORTED:
          toast('Command not supported by device')
          throw new TransactionError('Command not supported by device')
        default:
          console.log(`Unknown status 0x${status.toString(16)}, retry ${attempt + 1}/${maxRetries}...`)
          await _sleep(20)
          continue
      }
    }
    throw new TransactionError('Max retries exceeded waiting for device response')
  })
}
