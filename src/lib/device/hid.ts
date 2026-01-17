import { Device } from './device'
import { RAZER_VID, SUPPORTED_DEVICE_INFO } from './devices'
import type { DeviceInfo } from './builder'
import { RAZER_REPORT_ID, RazerReport } from './report'
import { find, groupBy, some } from 'lodash'

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

type HidProductKey = `${number}:${number}`

const productKey = (d: HIDDevice): HidProductKey => `${d.vendorId}:${d.productId}`

const matchesFilters = (d: HIDDevice, filters: HIDDeviceFilter[]) =>
  some(
    filters,
    (f) =>
      (f.vendorId === undefined || f.vendorId === d.vendorId) &&
      (f.productId === undefined || f.productId === d.productId)
  )

const selectBestInterface = (sameProduct: HIDDevice[], fallback: HIDDevice): HIDDevice => {
  return (
    find(sameProduct, (dev) => dev.collections.some((c) => (c.featureReports?.length ?? 0) > 0)) ??
    find(sameProduct, (dev) => dev.collections.some((c) => c.usagePage === 0xff00)) ??
    fallback
  )
}

const pickBestInterfaces = (devices: HIDDevice[], fallbackByKey?: Map<HidProductKey, HIDDevice>) => {
  const groups = groupBy(devices, productKey)
  return Object.entries(groups).map(([key, sameProduct]) =>
    selectBestInterface(sameProduct, fallbackByKey?.get(key as HidProductKey) ?? sameProduct[0])
  )
}

const defaultFilters = (options?: HIDDeviceRequestOptions) => options?.filters ?? [{ vendorId: RAZER_VID }]

export const getHidInterfaces = async (
  options?: HIDDeviceRequestOptions
): Promise<Result<HIDDevice, RequestHidDeviceError | OpenHidDeviceError>[]> => {
  const filters = defaultFilters(options)
  const all = await navigator.hid.getDevices()
  const matching = all.filter((d) => matchesFilters(d, filters))
  const bestInterfaces = pickBestInterfaces(matching)
  const results = []
  for (const hid of bestInterfaces) {
    if (!hid.opened) {
      try {
        await hid.open()
      } catch (e) {
        results.push({ error: new OpenHidDeviceError('Failed to open HID device') })
        continue
      }
    }
    results.push({ value: hid })
  }
  return results
}

export const requestHidInterface = async (
  options?: HIDDeviceRequestOptions
): Promise<Result<HIDDevice, RequestHidDeviceError | OpenHidDeviceError>> => {
  const filters = defaultFilters(options)
  try {
    const [requested] = await navigator.hid.requestDevice(options ?? { filters })
    if (!requested) return { error: new RequestHidDeviceError('No device selected') }
    const bestInterface = pickBestInterfaces([requested])[0]
    if (!bestInterface.opened) {
      try {
        await bestInterface.open()
      } catch {
        return { error: new OpenHidDeviceError('Failed to open HID device') }
      }
    }
    return { value: bestInterface }
  } catch {
    return { error: new RequestHidDeviceError('User cancelled or requestDevice failed') }
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
    await _sleep(10)

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
        await _sleep(10)
        continue
      }

      if (responseTxId !== expectedTxId) {
        console.warn(
          `Stale report (tx: 0x${responseTxId.toString(16)}, expected: 0x${expectedTxId.toString(16)}), retry ${
            attempt + 1
          }/${maxRetries}`
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
          throw new TransactionError('Device returned failure status')
        case RAZER_STATUS.TIMEOUT:
          throw new TransactionError('Device returned timeout status')
        case RAZER_STATUS.NOT_SUPPORTED:
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
