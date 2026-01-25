import { action, observable } from 'mobx'
import { Mutex } from '../mutex'

import type { DpiData, DpiInfo } from '../capabilities/dpi'
import type { DpiStagesData, DpiStagesInfo } from '../capabilities/dpiStages'
import type { PollingData, PollingInfo } from '../capabilities/polling'
import type { Polling2Data, Polling2Info } from '../capabilities/polling2'
import type { SerialData, SerialInfo } from '../capabilities/serial'
import type { FirmwareVersionInfo, FirmwareVersionData } from '../capabilities/firmwareVersion'
import type { ChargeLevelData, ChargeLevelInfo } from '../capabilities/chargeLevel'
import type { ChargeStatusData, ChargeStatusInfo } from '../capabilities/chargeStatus'
import type { IdleTimeData, IdleTimeInfo } from '../capabilities/idleTime'
import type { DongleLedMultiData, DongleLedMultiInfo } from '../capabilities/dongleLedMulti'
import { getDeviceProfile } from './devices'

export type DeviceStatus = 'Initializing' | 'Ready' | 'Failed'

export type CapabilityInfoMap = {
  chargeLevel: ChargeLevelInfo
  chargeStatus: ChargeStatusInfo
  dpi: DpiInfo
  dpiStages: DpiStagesInfo
  dongleLedMulti: DongleLedMultiInfo
  firmwareVersion: FirmwareVersionInfo
  idleTime: IdleTimeInfo
  polling: PollingInfo
  polling2: Polling2Info
  serial: SerialInfo
}

export type CapabilityDataMap = {
  chargeLevel: ChargeLevelData
  chargeStatus: ChargeStatusData
  dpi: DpiData
  dpiStages: DpiStagesData
  dongleLedMulti: DongleLedMultiData
  firmwareVersion: FirmwareVersionData
  idleTime: IdleTimeData
  polling: PollingData
  polling2: Polling2Data
  serial: SerialData
}

export type CapabilityKey = keyof CapabilityInfoMap

export type CapabilityState<K extends CapabilityKey, S extends DeviceStatus> =
  | { enabled: false; info?: never; data?: never }
  | (S extends 'Ready'
      ? { enabled: true; info: CapabilityInfoMap[K]; data: CapabilityDataMap[K] }
      : { enabled: true; info: CapabilityInfoMap[K]; data?: CapabilityDataMap[K] })

export type Capabilities<S extends DeviceStatus> = { [K in CapabilityKey]: CapabilityState<K, S> }

export type EnabledCapabilities<S extends DeviceStatus, K extends CapabilityKey> = Capabilities<S> & {
  [P in K]-?: CapabilityState<P, S> & { enabled: true }
}

export type DeviceProfile = {
  capabilityInfo: Partial<{ [K in CapabilityKey]: CapabilityInfoMap[K] }>
}

const CAP_KEYS = [
  'chargeLevel',
  'chargeStatus',
  'dpi',
  'dpiStages',
  'dongleLedMulti',
  'firmwareVersion',
  'idleTime',
  'polling',
  'polling2',
  'serial'
] satisfies CapabilityKey[]

type CapabilityDefaults = {
  [K in CapabilityKey]: { enabled: false }
}

const DISABLED_CAPS: CapabilityDefaults = {
  chargeLevel: { enabled: false },
  chargeStatus: { enabled: false },
  dpi: { enabled: false },
  dpiStages: { enabled: false },
  dongleLedMulti: { enabled: false },
  firmwareVersion: { enabled: false },
  idleTime: { enabled: false },
  polling: { enabled: false },
  polling2: { enabled: false },
  serial: { enabled: false }
}

function buildCapabilities<S extends DeviceStatus>(info: DeviceProfile['capabilityInfo']): Capabilities<S> {
  const out: Record<CapabilityKey, unknown> = { ...DISABLED_CAPS }
  for (const k of CAP_KEYS) {
    if (Object.prototype.hasOwnProperty.call(info, k)) out[k] = { enabled: true, info: info[k] }
  }
  return out as Capabilities<S>
}

export class DeviceNotSupportedError extends Error {
  readonly name = 'DeviceNotSupportedError'
  constructor(
    readonly vid: number,
    readonly pid: number
  ) {
    super(`Device not supported: VID=${vid.toString(16)}, PID=${pid.toString(16)}`)
  }
}
export class Device {
  @observable accessor id: number
  @observable accessor status: DeviceStatus = 'Initializing'
  @observable accessor error: Error | null = null
  @observable accessor capabilities: Capabilities<DeviceStatus>

  readonly hid: HIDDevice
  readonly _lock: Mutex

  constructor(hid: HIDDevice) {
    const profile = getDeviceProfile(hid.vendorId, hid.productId)
    if (!profile) {
      throw new DeviceNotSupportedError(hid.vendorId, hid.productId)
    }

    this.hid = hid
    this.id = (hid.vendorId << 16) + hid.productId
    this._lock = new Mutex()
    this.capabilities = buildCapabilities<DeviceStatus>(profile.capabilityInfo)
  }

  @action
  setCapabilityData<K extends CapabilityKey>(key: K, data: CapabilityDataMap[K]) {
    const cap = this.capabilities[key]
    if (!cap.enabled) throw new Error(`Capability "${String(key)}" is disabled for this device`)
    ;(cap as { data?: CapabilityDataMap[K] }).data = data
  }
}

export type DeviceInStatus<S extends DeviceStatus> = Device & {
  status: S
  error: S extends 'Failed' ? Error : null
  capabilities: Capabilities<S>
}

export type DeviceWithCapabilities<K extends CapabilityKey> = Device & {
  capabilities: EnabledCapabilities<DeviceStatus, K>
}

export type ReadyDeviceWithCapabilities<K extends CapabilityKey> = DeviceInStatus<'Ready'> & {
  capabilities: EnabledCapabilities<'Ready', K>
}

export function isStatus(device: Device, status: 'Ready'): device is DeviceInStatus<'Ready'>
export function isStatus(device: Device, status: 'Failed'): device is DeviceInStatus<'Failed'>
export function isStatus(device: Device, status: 'Initializing'): device is DeviceInStatus<'Initializing'>
export function isStatus(device: Device, status: DeviceStatus): boolean {
  return device.status === status
}

export function isCapableOf<K extends CapabilityKey>(
  device: DeviceInStatus<'Ready'>,
  caps: K[]
): device is ReadyDeviceWithCapabilities<K>
export function isCapableOf<K extends CapabilityKey>(device: Device, caps: K[]): device is DeviceWithCapabilities<K>
export function isCapableOf<K extends CapabilityKey>(device: Device, caps: K[]): boolean {
  return caps.every((k) => device.capabilities[k].enabled === true)
}
