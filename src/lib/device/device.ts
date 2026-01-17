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

export type DeviceStatus = 'Ready' | 'Failed' | 'Initializing'

export type IDevice = {
  id: number
  status: DeviceStatus
  error: Error | null
  capabilityData: CapabilityData
  hid: HIDDevice
  supportedCapabilities: SupportedCapabilities
  limits: CapabilityLimits
  _lock: Mutex
  _txId: { value: number }
  setCapabilityData<K extends keyof CapabilityData>(key: K, data: CapabilityData[K]): void
}

export type ReadyDevice = IDevice & {
  status: 'Ready'
}

export type FailedDevice = IDevice & {
  status: 'Failed'
  error: Error
}

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

export type HydratedCapabilityLimits<C extends keyof SupportedCapabilities> = {
  [K in Extract<C, keyof CapabilityLimits>]-?: NonNullable<CapabilityLimits[K]>
}

export type PossibleCapabilityData<C extends keyof SupportedCapabilities> = {
  [K in Extract<C, keyof CapabilityData>]: CapabilityData[K]
}

export type HydratedCapabilityData<C extends keyof SupportedCapabilities> = {
  [K in Extract<C, keyof CapabilityData>]-?: NonNullable<CapabilityData[K]>
}

export type DeviceWithCapabilities<C extends keyof SupportedCapabilities> = IDevice & {
  supportedCapabilities: SupportedCapabilities
  limits: HydratedCapabilityLimits<C>
  capabilityData: PossibleCapabilityData<C>
}

export type ReadyDeviceWithCapabilities<C extends keyof SupportedCapabilities> = ReadyDevice & {
  supportedCapabilities: SupportedCapabilities
  limits: HydratedCapabilityLimits<C>
  capabilityData: HydratedCapabilityData<C>
}

export function isCapableOf<C extends keyof SupportedCapabilities>(
  device: ReadyDevice,
  capabilities: C[]
): device is ReadyDeviceWithCapabilities<C>

export function isCapableOf<C extends keyof SupportedCapabilities>(
  device: IDevice,
  capabilities: C[]
): device is DeviceWithCapabilities<C>

export function isCapableOf<C extends keyof SupportedCapabilities>(device: IDevice, capabilities: C[]): boolean {
  return capabilities.every((cap) => device.supportedCapabilities[cap] === true)
}

export function isStatus(device: IDevice, status: 'Failed'): device is FailedDevice
export function isStatus(device: IDevice, status: 'Ready'): device is ReadyDevice
export function isStatus(device: IDevice, status: DeviceStatus): boolean {
  return device.status === status
}

export class Device implements IDevice {
  @observable accessor id: number
  @observable accessor status: DeviceStatus = 'Initializing'
  @observable accessor error: Error | null = null
  @observable accessor capabilityData: CapabilityData = {}

  readonly hid: HIDDevice
  readonly supportedCapabilities: SupportedCapabilities
  readonly limits: CapabilityLimits
  readonly _lock: Mutex
  readonly _txId: { value: number }

  constructor(deviceInfo: DeviceInfo, hid: HIDDevice) {
    this.hid = hid
    this.id = (hid.vendorId << 16) + hid.productId
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
