import { action, observable } from 'mobx'
import type { DpiData, DpiInfo } from '../capabilities/dpi'
import type { DpiStagesData, DpiStagesInfo } from '../capabilities/dpiStages'
import type { Polling2Data, Polling2Info } from '../capabilities/polling2'
import { Mutex } from '../mutex'
import type { SerialData, SerialInfo } from '../capabilities/serial'
import type { FirmwareVersionInfo, FirmwareVersionData } from '../capabilities/firmwareVersion'
import type { ChargeLevelData, ChargeLevelInfo } from '../capabilities/chargeLevel'
import type { ChargeStatusData, ChargeStatusInfo } from '../capabilities/chargeStatus'
import type { IdleTimeData, IdleTimeInfo } from '../capabilities/idleTime'
import type { DeviceInfo } from './builder'
import type { PollingData, PollingInfo } from '../capabilities/polling'

export type DeviceStatus = 'Ready' | 'Failed' | 'Initializing'

export type IDevice = {
  id: number
  status: DeviceStatus
  error: Error | null
  capabilityData: CapabilityData
  hid: HIDDevice
  supportedCapabilities: SupportedCapabilities
  capabilityInfo: CapabilityInfo
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
  polling2: boolean
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
  polling2?: Polling2Data
  serial?: SerialData
}

export type CapabilityInfo = {
  chargeLevel?: ChargeLevelInfo
  chargeStatus?: ChargeStatusInfo
  dpi?: DpiInfo
  dpiStages?: DpiStagesInfo
  firmwareVersion?: FirmwareVersionInfo
  idleTime?: IdleTimeInfo
  polling?: PollingInfo
  polling2?: Polling2Info
  serial?: SerialInfo
}

export type HydratedCapabilityInfo<C extends keyof SupportedCapabilities> = {
  [K in Extract<C, keyof CapabilityInfo>]-?: NonNullable<CapabilityInfo[K]>
}

export type PossibleCapabilityData<C extends keyof SupportedCapabilities> = {
  [K in Extract<C, keyof CapabilityData>]: CapabilityData[K]
}

export type HydratedCapabilityData<C extends keyof SupportedCapabilities> = {
  [K in Extract<C, keyof CapabilityData>]-?: NonNullable<CapabilityData[K]>
}

export type DeviceWithCapabilities<C extends keyof SupportedCapabilities> = IDevice & {
  supportedCapabilities: SupportedCapabilities
  capabilityInfo: HydratedCapabilityInfo<C>
  capabilityData: PossibleCapabilityData<C>
}

export type ReadyDeviceWithCapabilities<C extends keyof SupportedCapabilities> = ReadyDevice & {
  supportedCapabilities: SupportedCapabilities
  capabilityInfo: HydratedCapabilityInfo<C>
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
  readonly capabilityInfo: CapabilityInfo
  readonly _lock: Mutex
  readonly _txId: { value: number }

  constructor(deviceInfo: DeviceInfo, hid: HIDDevice) {
    this.hid = hid
    this.id = (hid.vendorId << 16) + hid.productId
    this.supportedCapabilities = deviceInfo.supportedCapabilities
    this.capabilityInfo = deviceInfo.capabilityInfo
    this._lock = new Mutex()
    this._txId = { value: 1 }
  }

  @action
  setCapabilityData<K extends keyof CapabilityData>(key: K, data: CapabilityData[K]) {
    this.capabilityData[key] = data
  }
}
