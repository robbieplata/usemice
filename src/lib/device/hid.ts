import { VID_RAZER } from './constants'
import type { Mutex } from '../mutex'
import { find, groupBy, some } from 'lodash'

const DEFAULT_FILTER = [{ vendorId: VID_RAZER }]

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

export type HidSession = {
  hid: HIDDevice
  _lock: Mutex
}

export const sendBuffer = async (
  hidDevice: HIDDevice,
  reportId: number,
  buffer: ArrayBuffer
): Promise<Result<undefined, OpenHidDeviceError>> => {
  try {
    if (!hidDevice.opened) return { error: new OpenHidDeviceError('Device is not opened') }
    await hidDevice.sendFeatureReport(reportId, buffer)
  } catch (e) {
    if (e instanceof Error) return { error: new OpenHidDeviceError(`Failed to send report: ${e.message}`) }
    return { error: new OpenHidDeviceError('Failed to send report: unknown error') }
  }
  return { value: undefined }
}

export const receiveBuffer = async (
  hidDevice: HIDDevice,
  reportId: number
): Promise<Result<Uint8Array, OpenHidDeviceError>> => {
  if (!hidDevice.opened) return { error: new OpenHidDeviceError('Device is not opened') }
  const view = await hidDevice.receiveFeatureReport(reportId)
  return { value: new Uint8Array(view.buffer, view.byteOffset, view.byteLength) }
}

export class TransactionError extends Error {
  readonly name = 'TransactionError'
  constructor(message: string) {
    super(message)
  }
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

export const selectBestInterface = (sameProduct: HIDDevice[]): HIDDevice | undefined =>
  find(sameProduct, (dev) => dev.collections.some((c) => (c.featureReports?.length ?? 0) > 0)) ??
  find(sameProduct, (dev) => dev.collections.some((c) => c.usagePage === 0xff00))

const pickBestInterfaces = (devices: HIDDevice[]): HIDDevice[] => {
  const groups = groupBy(devices, productKey)
  return Object.values(groups)
    .map(selectBestInterface)
    .filter((d): d is HIDDevice => d !== undefined)
}

const defaultFilters = (options?: HIDDeviceRequestOptions) => options?.filters ?? DEFAULT_FILTER

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
    if (!requested) return { error: new RequestHidDeviceError('No device selected') }

    const { vendorId: vid, productId: pid } = requested
    const bestInterface = await navigator.hid.getDevices().then((devices) => {
      const sameProduct = devices.filter((d) => d.vendorId === vid && d.productId === pid)
      return selectBestInterface(sameProduct)
    })

    if (!bestInterface) return { error: new RequestHidDeviceError('No compatible HID interface found') }
    return { value: bestInterface }
  } catch {
    return { error: new RequestHidDeviceError('Failed to request HID device') }
  }
}
