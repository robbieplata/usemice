import { makeAutoObservable } from 'mobx'
import type { DpiData, DpiLimits } from '../capabilities/dpi'
import type { DpiStagesData, DpiStagesLimits } from '../capabilities/dpiStages'
import type { PollingData, PollingLimits } from '../capabilities/polling'
import { Mutex } from '../mutex'
import type { SerialData, SerialLimits } from '../capabilities/serial'
import type { FirmwareVersionLimits, FirmwareVersionData } from '../capabilities/firmwareVersion'
import type { ChargeLevelData, ChargeLevelLimits } from '../capabilities/chargeLevel'
import type { ChargeStatusData, ChargeStatusLimits } from '../capabilities/chargeStatus'
import type { IdleTimeData, IdleTimeLimits } from '../capabilities/idleTime'

export type DeviceStatus = 'Ready' | 'Pending' | 'Failed'

export type SupportedCapabilities = {
  chargeLevel: boolean
  chargeStatus: boolean
  dpi: boolean
  dpiStages: boolean
  firmwareVersion: boolean
  idleTime: boolean
  polling: boolean
  serial: boolean
}

export type CapabilityData = {
  chargeLevel?: ChargeLevelData
  chargeStatus?: ChargeStatusData
  dpi?: DpiData
  dpiStages?: DpiStagesData
  firmwareVersion?: FirmwareVersionData
  idleTime?: IdleTimeData
  polling?: PollingData
  serial?: SerialData
}

export type CapabilityLimits = {
  chargeLevel?: ChargeLevelLimits
  chargeStatus?: ChargeStatusLimits
  dpi?: DpiLimits
  dpiStages?: DpiStagesLimits
  firmwareVersion?: FirmwareVersionLimits
  idleTime?: IdleTimeLimits
  polling?: PollingLimits
  serial?: SerialLimits
}

export type CapabilityKey = keyof SupportedCapabilities

export type HydratedCapabilityLimits<C extends CapabilityKey> = {
  [K in Extract<C, keyof CapabilityLimits>]: Exclude<CapabilityLimits[K], undefined>
}
export class Device {
  name: string
  status: DeviceStatus = 'Pending'
  error: Error | null = null
  capabilityData: CapabilityData = {}

  readonly hid: HIDDevice
  readonly supportedCapabilities: SupportedCapabilities
  readonly limits: CapabilityLimits
  readonly _lock: Mutex
  readonly _txId: { value: number }

  constructor(params: {
    name: string
    hid: HIDDevice
    supportedCapabilities: SupportedCapabilities
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
  supportedCapabilities: SupportedCapabilities
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
