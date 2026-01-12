import type { Effect, Ref } from 'effect'
import type { DpiData, DpiMethods } from '../capabilities/dpi'
import type { Polling2Data, Polling2Methods } from '../capabilities/polling2'
import type { SerialMethods } from '../capabilities/serial'

export type DeviceStatus = 'Ready' | 'Pending' | 'Failed'

export type Device = {
  name: string
  supportedCapabilities: SupportedCapabilities
  capabilityData: CapabilityData
  capabilities: CapabilityMethods
  limits: UnknownCapabilityLimits
  error?: Error
  hid: HIDDevice
  status: DeviceStatus
  _lock: Effect.Semaphore
  _txId: Ref.Ref<number>
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

export type SupportedCapabilities = {
  dpi?: boolean
  polling2?: boolean
  serial?: boolean
}

export type CapabilityData = {
  dpi?: DpiData
  polling2?: Polling2Data
  serial?: string
}

export type CapabilityMethods = {
  dpi?: DpiMethods
  polling2?: Polling2Methods
  serial?: SerialMethods
}

export type UnknownCapabilityLimits = {
  dpi?: {
    minDpi: number
    maxDpi: number
    maxStages: number
  }
  polling2?: {
    supportedIntervals: number[]
  }
  serial?: {
    length: string
  }
}

export type CapabilityKey = keyof SupportedCapabilities

export type HydratedSupportedCapabilities<C extends CapabilityKey> = Record<C, true>

export type PossibleCapabilityLimits<C extends CapabilityKey> = Pick<
  UnknownCapabilityLimits,
  Extract<C, keyof UnknownCapabilityLimits>
>

export type HydratedCapabilityLimits<C extends CapabilityKey> = {
  [K in Extract<C, keyof UnknownCapabilityLimits>]: Exclude<UnknownCapabilityLimits[K], undefined>
}

export type PossibleCapabilityData<C extends CapabilityKey> = Pick<CapabilityData, Extract<C, keyof CapabilityData>>

export type PossibleCapabilityMethods<C extends CapabilityKey> = Pick<
  CapabilityMethods,
  Extract<C, keyof CapabilityMethods>
>

export type HydratedDeviceData<C extends CapabilityKey> = {
  [K in Extract<C, keyof CapabilityData>]: Exclude<CapabilityData[K], undefined>
}

export type HydratedCapabilityMethods<C extends CapabilityKey> = {
  [K in Extract<C, keyof CapabilityMethods>]: Exclude<CapabilityMethods[K], undefined>
}

export type DeviceWithCapabilities<C extends CapabilityKey> = Device & {
  supportedCapabilities: HydratedSupportedCapabilities<C>
  limits: HydratedCapabilityLimits<C>
  capabilityData: PossibleCapabilityData<C>
  capabilities: PossibleCapabilityMethods<C>
}

export type FailedDeviceWithCapabilities<C extends CapabilityKey> = FailedDevice & {
  supportedCapabilities: HydratedSupportedCapabilities<C>
  limits: never
  capabilityData: never
  capabilities: never
}

export type ReadyDeviceWithCapabilities<C extends CapabilityKey> = ReadyDevice & {
  supportedCapabilities: HydratedSupportedCapabilities<C>
  limits: HydratedCapabilityLimits<C>
  capabilityData: HydratedDeviceData<C>
  capabilities: HydratedCapabilityMethods<C>
}

export function isStatus(device: Device, status: 'Ready'): device is ReadyDevice
export function isStatus(device: Device, status: 'Failed'): device is FailedDevice
export function isStatus(device: Device, status: 'Pending'): device is PendingDevice
export function isStatus(device: Device, status: DeviceStatus): boolean {
  return device.status === status
}

export function isCapableOf<C extends keyof Partial<SupportedCapabilities>>(
  device: FailedDevice,
  supportedCapabilities: C[]
): device is FailedDeviceWithCapabilities<C>
export function isCapableOf<C extends keyof Partial<SupportedCapabilities>>(
  device: ReadyDevice,
  supportedCapabilities: C[]
): device is ReadyDeviceWithCapabilities<C>
export function isCapableOf<C extends keyof Partial<SupportedCapabilities>>(
  device: Device,
  supportedCapabilities: C[]
): device is DeviceWithCapabilities<C>
export function isCapableOf<C extends keyof Partial<SupportedCapabilities>>(
  device: Device,
  supportedCapabilities: C[]
): boolean {
  return supportedCapabilities.every((cap) => device.supportedCapabilities[cap] === true)
}
