import { makeAutoObservable } from 'mobx'
import type { DpiData, DpiLimits } from '../capabilities/dpi'
import type { DpiStagesData, DpiStagesLimits } from '../capabilities/dpi-stages'
import type { PollingData, PollingLimits } from '../capabilities/polling'
import { Mutex } from '../mutex'
import type { SerialLimits } from '../capabilities/serial'
import type { FirmwareVersionLimits, FirmwareVersionData } from '../capabilities/firmwareVersion'

export type DeviceStatus = 'Ready' | 'Pending' | 'Failed'

export type SupportedCapabilities = {
  dpi?: boolean
  dpiStages?: boolean
  polling?: boolean
  serial?: boolean
  firmwareVersion?: boolean
}

export type CapabilityData = {
  dpi?: DpiData
  dpiStages?: DpiStagesData
  polling?: PollingData
  serial?: string
  firmwareVersion?: FirmwareVersionData
}

export type CapabilityLimits = {
  dpi?: DpiLimits
  dpiStages?: DpiStagesLimits
  polling?: PollingLimits
  serial?: SerialLimits
  firmwareVersion?: FirmwareVersionLimits
}

export type CapabilityKey = keyof SupportedCapabilities

export type HydratedSupportedCapabilities<C extends CapabilityKey> = Record<C, true>

export type HydratedCapabilityLimits<C extends CapabilityKey> = {
  [K in Extract<C, keyof CapabilityLimits>]: Exclude<CapabilityLimits[K], undefined>
}
export class Device {
  name: string
  status: DeviceStatus = 'Pending'
  error: Error | null = null
  capabilityData: CapabilityData = {}

  readonly hid: HIDDevice
  readonly supportedCapabilities: HydratedSupportedCapabilities<CapabilityKey>
  readonly limits: CapabilityLimits
  readonly _lock: Mutex
  readonly _txId: { value: number }

  constructor(params: {
    name: string
    hid: HIDDevice
    supportedCapabilities: HydratedSupportedCapabilities<CapabilityKey>
    limits: CapabilityLimits
  }) {
    this.name = params.name
    this.hid = params.hid
    this.supportedCapabilities = params.supportedCapabilities
    this.limits = params.limits
    this._lock = new Mutex()
    this._txId = { value: 1 }

    makeAutoObservable(this, {
      hid: false,
      supportedCapabilities: false,
      limits: false,
      _lock: false,
      _txId: false
    })
  }
}

export type HydratedCapabilityData<C extends CapabilityKey> = {
  [K in Extract<C, keyof CapabilityData>]: Exclude<CapabilityData[K], undefined>
}

export type DeviceWithCapabilities<C extends CapabilityKey> = Device & {
  supportedCapabilities: HydratedSupportedCapabilities<C>
  limits: HydratedCapabilityLimits<C>
  capabilityData: HydratedCapabilityData<C>
}

export type ReadyDevice = Device & {
  status: 'Ready'
}

export type FailedDevice = Device & {
  status: 'Failed'
  error: Error
}

export function isCapableOf<C extends CapabilityKey>(
  device: Device,
  capabilities: C[]
): device is DeviceWithCapabilities<C> {
  return capabilities.every((cap) => device.supportedCapabilities[cap] === true)
}

export function isReady(device: Device): device is ReadyDevice {
  return device.status === 'Ready'
}

export function isFailed(device: Device): device is FailedDevice {
  return device.status === 'Failed'
}
