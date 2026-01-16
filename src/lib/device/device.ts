import { action, observable } from 'mobx'
import type { DpiData, DpiLimits } from '../capabilities/dpi'
import type { DpiStagesData, DpiStagesLimits } from '../capabilities/dpiStages'
import type { PollingData, PollingLimits } from '../capabilities/polling'
import { Mutex } from '../mutex'
import type { SerialData, SerialLimits } from '../capabilities/serial'
import type { FirmwareVersionLimits, FirmwareVersionData } from '../capabilities/firmwareVersion'
import type { ChargeLevelData, ChargeLevelLimits } from '../capabilities/chargeLevel'
import type { ChargeStatusData, ChargeStatusLimits } from '../capabilities/chargeStatus'
import type { IdleTimeData, IdleTimeLimits } from '../capabilities/idleTime'
import type { DeviceInfo } from './builder'

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
export function isStatus(device: Device, status: 'Failed'): device is FailedDevice
export function isStatus(device: Device, status: 'Ready'): device is ReadyDevice
export function isStatus(device: Device, status: DeviceStatus): boolean {
  return device.status === status
}

export class Device {
  @observable accessor name: string
  @observable accessor status: DeviceStatus = 'Pending'
  @observable accessor error: Error | null = null
  @observable accessor capabilityData: CapabilityData

  readonly hid: HIDDevice
  readonly supportedCapabilities: SupportedCapabilities
  readonly limits: CapabilityLimits
  readonly _lock: Mutex
  readonly _txId: { value: number }

  constructor(deviceInfo: DeviceInfo<CapabilityKey>, hid: HIDDevice) {
    this.name = deviceInfo.name
    this.hid = hid
    this.capabilityData = {}
    this.supportedCapabilities = deviceInfo.supportedCapabilities
    this.limits = deviceInfo.limits
    this._lock = new Mutex()
    this._txId = { value: 1 }
  }

  @action
  setCapabilityData<K extends keyof CapabilityData>(key: K, data: CapabilityData[K]) {
    this.capabilityData[key] = data
  }
}
