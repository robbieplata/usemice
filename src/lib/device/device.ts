import type { DpiData } from '../capabilities/dpi'
import type { Polling2Data } from '../capabilities/polling2'

export type UnknownCapabilities = {
  dpi?: boolean
  polling2?: boolean
  serial?: boolean
}

export type CapabilityData = {
  dpi?: DpiData
  polling2?: Polling2Data
  serial?: string
}

export type DeviceStatus = 'Ready' | 'Pending' | 'Failed' | 'Disconnected'

export type Device = {
  name: string
  capabilities: UnknownCapabilities
  data: CapabilityData
  error?: Error
  hid: HIDDevice
  status: DeviceStatus
}

export type ReadyDevice = Device & {
  status: 'Ready'
}

export type PendingDevice = Device & {
  status: 'Pending'
}

export type FailedDevice = Device & {
  status: 'Failed'
  error: Error
}

export type CapabilityKey = keyof UnknownCapabilities

export type KnownCapabilities<C extends CapabilityKey> = Record<C, true>

export type PossibleDeviceData<C extends CapabilityKey> = Pick<CapabilityData, Extract<C, keyof CapabilityData>>

export type HydratedDeviceData<C extends CapabilityKey> = {
  [K in Extract<C, keyof CapabilityData>]: Exclude<CapabilityData[K], undefined>
}

export type FailedDeviceWithCapabilities<C extends CapabilityKey> = FailedDevice & {
  capabilities: KnownCapabilities<C>
  data: never
}

export type DeviceWithCapabilities<C extends CapabilityKey> = Device & {
  capabilities: KnownCapabilities<C>
  data: PossibleDeviceData<C>
}

export type ReadyDeviceWithCapabilities<C extends CapabilityKey> = ReadyDevice & {
  capabilities: KnownCapabilities<C>
  data: HydratedDeviceData<C>
}

export function isStatus(device: Device, status: 'Ready'): device is ReadyDevice
export function isStatus(device: Device, status: 'Failed'): device is FailedDevice
export function isStatus(device: Device, status: 'Pending'): device is PendingDevice
export function isStatus(device: Device, status: DeviceStatus): boolean {
  return device.status === status
}

export function isCapableOf<C extends keyof Partial<UnknownCapabilities>>(
  device: FailedDevice,
  capabilities: C[]
): device is FailedDeviceWithCapabilities<C>
export function isCapableOf<C extends keyof Partial<UnknownCapabilities>>(
  device: ReadyDevice,
  capabilities: C[]
): device is ReadyDeviceWithCapabilities<C>
export function isCapableOf<C extends keyof Partial<UnknownCapabilities>>(
  device: Device,
  capabilities: C[]
): device is DeviceWithCapabilities<C>
export function isCapableOf<C extends keyof Partial<UnknownCapabilities>>(device: Device, capabilities: C[]): boolean {
  return capabilities.every((cap) => device.capabilities[cap] === true)
}
