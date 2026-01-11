import type { DpiData } from '../capabilities/dpi'
import type { Polling2Data } from '../capabilities/polling2'

export type UnknownCapabilities = {
  dpi?: boolean
  polling2?: boolean
  serial?: boolean
}

export type UnknownCapabilityData = {
  dpi?: DpiData
  polling2?: Polling2Data
  serial?: string
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
  serial?: {}
}

export type DeviceStatus = 'Ready' | 'Pending' | 'Failed' | 'Disconnected'

export type Device = {
  name: string
  capabilities: UnknownCapabilities
  data: UnknownCapabilityData
  limits: UnknownCapabilityLimits
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

export type PossibleCapabilityLimits<C extends CapabilityKey> = Pick<
  UnknownCapabilityLimits,
  Extract<C, keyof UnknownCapabilityLimits>
>

export type KnownCapabilityLimits<C extends CapabilityKey> = {
  [K in Extract<C, keyof UnknownCapabilityLimits>]: Exclude<UnknownCapabilityLimits[K], undefined>
}

export type PossibleDeviceData<C extends CapabilityKey> = Pick<
  UnknownCapabilityData,
  Extract<C, keyof UnknownCapabilityData>
>

export type HydratedDeviceData<C extends CapabilityKey> = {
  [K in Extract<C, keyof UnknownCapabilityData>]: Exclude<UnknownCapabilityData[K], undefined>
}

export type DeviceWithCapabilities<C extends CapabilityKey> = Device & {
  capabilities: KnownCapabilities<C>
  limits: KnownCapabilityLimits<C>
  data: PossibleDeviceData<C>
}

export type FailedDeviceWithCapabilities<C extends CapabilityKey> = FailedDevice & {
  capabilities: KnownCapabilities<C>
  limits: KnownCapabilityLimits<C>
  data: never
}

export type ReadyDeviceWithCapabilities<C extends CapabilityKey> = ReadyDevice & {
  capabilities: KnownCapabilities<C>
  limits: KnownCapabilityLimits<C>
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

const d: ReadyDeviceWithCapabilities<'dpi'> = {
  name: 'Test Device',
  capabilities: {
    dpi: true
  },
  limits: {
    dpi: {
      minDpi: 100,
      maxDpi: 45_000,
      maxStages: 5
    }
  },
  data: {
    dpi: {
      activeStage: 0,
      dpiLevels: [[100, 100]]
    }
  },
  hid: {} as HIDDevice,
  status: 'Ready' as const
}

d.limits.dpi
