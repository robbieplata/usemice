import { type CapabilityEntry, type CapabilityKey } from './device'
import { VID_RAZER } from './constants'
import { getRazerDefinition } from './razer/definitions'

export type DeviceDefinition = Partial<{ [K in CapabilityKey]: CapabilityEntry<K> }>

export class UnsupportedDeviceError extends Error {
  constructor(hid: HIDDevice) {
    super(`Unsupported device VID: ${hid.vendorId.toString(16)}, PID: ${hid.productId.toString(16)}`)
    this.name = 'UnsupportedDeviceError'
  }
}

export function getDeviceDefinition(hid: HIDDevice): DeviceDefinition {
  switch (hid.vendorId) {
    case VID_RAZER:
      return getRazerDefinition(hid)
  }
  throw new UnsupportedDeviceError(hid)
}
