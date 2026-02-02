// src/lib/device/device.ts
import { action, observable, reaction, runInAction, type IReactionDisposer } from 'mobx'
import { Mutex } from '../mutex'
import { getDeviceDefinition } from './definitions'
import { toast } from 'sonner'
import type { ChargeLevelInfo, ChargeLevelData } from '../capabilities/chargeLevel'
import type { ChargeStatusInfo, ChargeStatusData } from '../capabilities/chargeStatus'
import type { DongleLedInfo, DongleLedData } from '../capabilities/dongleLed'
import type { DongleLedMultiInfo, DongleLedMultiData } from '../capabilities/dongleLedMulti'
import type { DpiInfo, DpiData } from '../capabilities/dpi'
import type { DpiStagesInfo, DpiStagesData } from '../capabilities/dpiStages'
import type { FirmwareVersionInfo, FirmwareVersionData } from '../capabilities/firmwareVersion'
import type { IdleTimeInfo, IdleTimeData } from '../capabilities/idleTime'
import type { PollingInfo, PollingData } from '../capabilities/polling'
import type { SerialInfo, SerialData } from '../capabilities/serial'

export type DeviceStatus = 'Initializing' | 'Ready' | 'Failed'

export type CapabilityInfoMap = {
  chargeLevel: ChargeLevelInfo
  chargeStatus: ChargeStatusInfo
  dpi: DpiInfo
  dpiStages: DpiStagesInfo
  dongleLed: DongleLedInfo
  dongleLedMulti: DongleLedMultiInfo
  firmwareVersion: FirmwareVersionInfo
  idleTime: IdleTimeInfo
  polling: PollingInfo
  serial: SerialInfo
}

export type CapabilityDataMap = {
  chargeLevel: ChargeLevelData
  chargeStatus: ChargeStatusData
  dpi: DpiData
  dpiStages: DpiStagesData
  dongleLed: DongleLedData
  dongleLedMulti: DongleLedMultiData
  firmwareVersion: FirmwareVersionData
  idleTime: IdleTimeData
  polling: PollingData
  serial: SerialData
}

export type CapabilityKey = keyof CapabilityInfoMap

export type CapabilityState<K extends CapabilityKey, S extends DeviceStatus> = S extends 'Ready'
  ? { info: CapabilityInfoMap[K]; data: CapabilityDataMap[K]; command: CapabilityCommand<K, CapabilityDataMap[K]> }
  : { info: CapabilityInfoMap[K]; data?: CapabilityDataMap[K]; command: CapabilityCommand<K, CapabilityDataMap[K]> }

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
  failureReason: null
  commandErrors: CommandError[]
  capabilities: EnabledCapabilities<S, K>
}

export type DeviceInStatus<S extends DeviceStatus> = Device & {
  status: S
  failureReason: S extends 'Failed' ? Error : null
  commandErrors: CommandError[]
  capabilities: Capabilities<S>
}
export type DeviceInStatusVariant = DeviceInStatus<'Initializing'> | DeviceInStatus<'Ready'> | DeviceInStatus<'Failed'>

export function assertStatus<S extends DeviceStatus>(device: Device, status: S): asserts device is DeviceInStatus<S> {
  if (device.status !== status) {
    throw new Error(`Expected device status to be '${status}', but was '${device.status}'`)
  }
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

export function buildCapabilities(hid: HIDDevice): Capabilities<'Initializing'> {
  const definition = getDeviceDefinition(hid)
  const caps = {} as Record<CapabilityKey, CapabilityState<CapabilityKey, 'Initializing'>>
  for (const key of Object.keys(definition) as CapabilityKey[]) {
    const entry = definition[key]
    if (!entry) continue
    caps[key] = {
      info: entry.info,
      command: entry.command,
      data: undefined
    } as CapabilityState<CapabilityKey, 'Initializing'>
  }
  return caps as Capabilities<'Initializing'>
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

export class CommandError extends Error {
  readonly _timestamp = new Date()
  name = 'CommandError'
  readonly message: string
  constructor(error: Error | string) {
    super()
    if (typeof error === 'string') {
      this.message = error
    } else {
      this.name = error.name
      this.message = error.message
    }
  }
}

export class Device {
  @observable accessor id: number
  @observable accessor status: DeviceStatus
  @observable accessor failureReason: Error | null
  @observable accessor capabilities: Capabilities<DeviceStatus>
  @observable accessor commandErrors: CommandError[] = []

  readonly hid: HIDDevice
  readonly _lock: Mutex
  toastErrorsDisposer: IReactionDisposer

  constructor(hid: HIDDevice) {
    this.hid = hid
    this.id = (hid.vendorId << 16) + hid.productId
    this._lock = new Mutex()
    this.capabilities = buildCapabilities(hid)
    this.status = 'Initializing'
    this.failureReason = null
    this.commandErrors = []
    this.toastErrorsDisposer = reaction(
      () => this.commandErrors.length,
      (length, previousLength) => {
        if (length > previousLength) {
          const newError = this.commandErrors[length - 1]
          toast.warning(`${newError.name}: ${newError.message}`, {
            duration: 5000
          })
        }
      }
    )
  }

  @action.bound
  reset() {
    this.status = 'Initializing'
    this.failureReason = null
    this.commandErrors = []
  }

  @action.bound
  clearCommandErrors() {
    this.commandErrors = []
  }

  private entry<K extends CapabilityKey>(key: K) {
    const entry = this.capabilities[key]
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
  async get<K extends CapabilityKey>(key: K): Promise<CapabilityDataMap[K]> {
    const entry = this.entry(key)
    if (!isCapableOf(this, [key])) throw new Error(`Capability "${String(key)}" is disabled for this device`)
    if (!entry.command.get) throw new Error(`Cannot get ${String(key)}`)
    return await entry.command
      .get(this)
      .then((data) => {
        this.setCapabilityData(key, data)
        return data
      })
      .catch((err) => {
        runInAction(() => {
          if (err instanceof Error) {
            this.commandErrors.push(new CommandError(err))
          } else {
            this.commandErrors.push(new CommandError(String(err)))
          }
        })
        throw err
      })
  }

  @action
  async set<K extends CapabilityKey>(key: K, value: CapabilityDataMap[K]): Promise<void> {
    const entry = this.entry(key)
    if (!isCapableOf(this, [key])) throw new Error(`Capability "${String(key)}" is disabled for this device`)
    if (!entry.command.set) throw new Error(`Cannot set ${String(key)}`)
    await entry.command
      .set(this, value)
      .then(async () => {
        if (entry.command.get) {
          const data = await entry.command.get(this)
          this.setCapabilityData(key, data)
        }
      })
      .catch((err) => {
        runInAction(() => {
          if (err instanceof Error) {
            this.commandErrors.push(new CommandError(err))
          } else {
            this.commandErrors.push(new CommandError(String(err)))
          }
        })
      })
  }
}
