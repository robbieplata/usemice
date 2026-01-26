// src/lib/device/device.ts
import { action, observable } from 'mobx'
import { Mutex } from '../mutex'
import { getDeviceProfile, type DeviceProfile } from './devices'
import type { ChargeLevelData, ChargeLevelInfo } from '../capabilities/chargeLevel'
import type { ChargeStatusData, ChargeStatusInfo } from '../capabilities/chargeStatus'
import type { DpiData, DpiInfo } from '../capabilities/dpi'
import type { DpiStagesData, DpiStagesInfo } from '../capabilities/dpiStages'
import type { DongleLedMultiData, DongleLedMultiInfo } from '../capabilities/dongleLedMulti'
import type { FirmwareVersionData, FirmwareVersionInfo } from '../capabilities/firmwareVersion'
import type { IdleTimeData, IdleTimeInfo } from '../capabilities/idleTime'
import type { PollingData, PollingInfo } from '../capabilities/polling'
import type { Polling2Data, Polling2Info } from '../capabilities/polling2'
import type { SerialData, SerialInfo } from '../capabilities/serial'

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

export type CapabilityState<K extends CapabilityKey, S extends DeviceStatus> = S extends 'Ready'
  ? { info: CapabilityInfoMap[K]; data: CapabilityDataMap[K] }
  : { info: CapabilityInfoMap[K]; data?: CapabilityDataMap[K] }

export type Capabilities<S extends DeviceStatus> = Partial<{
  [K in CapabilityKey]: CapabilityState<K, S>
}>

export type EnabledCapabilities<S extends DeviceStatus, K extends CapabilityKey> = Capabilities<S> & {
  [P in K]-?: CapabilityState<P, S>
}

export type CapabilityCommand<C extends CapabilityKey, T> = {
  get?: (device: DeviceWithCapabilities<C>) => Promise<T>
  set?: (device: DeviceWithCapabilities<C>, value: T) => Promise<void>
}

export type CapabilityEntry<K extends CapabilityKey> = {
  info: CapabilityInfoMap[K]
  command: CapabilityCommand<K, CapabilityDataMap[K]>
}

export type DeviceWithCapabilities<K extends CapabilityKey> = Device & {
  capabilities: EnabledCapabilities<DeviceStatus, K>
}

export type ReadyDeviceWithCapabilities<K extends CapabilityKey, S extends DeviceStatus = 'Ready'> = Device & {
  status: S
  error: null
  capabilities: EnabledCapabilities<S, K>
}

export type DeviceInStatus<S extends DeviceStatus> = Device & {
  status: S
  error: S extends 'Failed' ? Error : null
  capabilities: Capabilities<S>
}
export type DeviceInStatusVariant = DeviceInStatus<'Initializing'> | DeviceInStatus<'Ready'> | DeviceInStatus<'Failed'>

export function assertStatus<S extends DeviceStatus>(device: Device, status: S): asserts device is DeviceInStatus<S> {
  device.status === status
}

export function isStatus<S extends DeviceStatus>(device: Device, status: S): device is DeviceInStatus<S> {
  return device.status === status
}

export function isCapableOf<K extends CapabilityKey>(device: Device, keys: K[]): device is DeviceWithCapabilities<K> {
  for (const key of keys) {
    if (device.capabilities[key] === undefined) {
      return false
    }
  }
  return true
}

function buildCapabilities<S extends DeviceStatus>(profile: DeviceProfile): Capabilities<S> {
  const caps: Partial<Record<CapabilityKey, any>> = {}
  for (const k in profile.capabilities) {
    const key = k as CapabilityKey
    const entry = profile.capabilities[key]
    if (entry) {
      caps[key] = {
        info: entry.info
      }
    }
  }
  return caps as Capabilities<S>
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
  @observable accessor status: DeviceStatus
  @observable accessor error: Error | null
  @observable accessor capabilities: Capabilities<DeviceStatus>

  readonly hid: HIDDevice
  readonly _lock: Mutex
  readonly profile: DeviceProfile

  constructor(hid: HIDDevice) {
    const profile = getDeviceProfile(hid.vendorId, hid.productId)
    if (!profile) throw new DeviceNotSupportedError(hid.vendorId, hid.productId)
    this.hid = hid
    this.id = (hid.vendorId << 16) + hid.productId
    this._lock = new Mutex()
    this.profile = profile
    this.capabilities = buildCapabilities<DeviceStatus>(profile)
    this.status = 'Initializing'
    this.error = null
  }

  private entry<K extends CapabilityKey>(key: K) {
    const entry = this.profile.capabilities[key]
    if (!entry) throw new Error(`Capability "${String(key)}" is disabled for this device`)
    return entry
  }

  @action
  setCapabilityData<K extends CapabilityKey>(key: K, data: CapabilityDataMap[K]) {
    const cap = this.capabilities[key]
    if (!cap) throw new Error(`Capability "${String(key)}" is disabled for this device`)
    cap.data = data
  }

  @action
  async get<K extends CapabilityKey>(key: K) {
    const entry = this.entry(key)
    if (!isCapableOf(this, [key])) throw new Error(`Capability "${String(key)}" is disabled for this device`)
    if (!entry.command.get) throw new Error(`Cannot get ${String(key)}`)
    const data = await entry.command.get(this as any)
    this.setCapabilityData(key, data)
    return data
  }

  @action
  async set<K extends CapabilityKey>(key: K, value: CapabilityDataMap[K]) {
    const entry = this.entry(key)
    if (!isCapableOf(this, [key])) throw new Error(`Capability "${String(key)}" is disabled for this device`)
    if (!entry.command.set) throw new Error(`Cannot set ${String(key)}`)
    await entry.command.set(this as any, value)
    if (entry.command.get) {
      const data = await entry.command.get(this as any)
      this.setCapabilityData(key, data)
    }
  }
}
