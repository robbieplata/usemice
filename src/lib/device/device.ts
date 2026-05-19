import { action, observable, reaction, type IReactionDisposer } from 'mobx'
import { Mutex } from '../mutex'
import { toast } from 'sonner'
import { type DiscoveredRazerCapabilities, type RazerCapabilityKey, type RazerCapabilityClasses } from './razer'
import { type DiscoveredHidppCapabilities, type HidppCapabilityKey, type HidppCapabilityClasses } from './logitech'

export type DeviceStatus = 'Initializing' | 'Ready' | 'Failed'
export type CapabilityKey = RazerCapabilityKey | HidppCapabilityKey

export type IDevice = {
  readonly type: 'razer' | 'hidpp'
  readonly hid: HIDDevice
  readonly _lock: Mutex
  id: number
  status: DeviceStatus
  failureReason: Error | null
  capabilities: DiscoveredRazerCapabilities | DiscoveredHidppCapabilities
  commandErrors: CommandError[]
  reset(): void
  setCapabilities(capabilities: DiscoveredRazerCapabilities | DiscoveredHidppCapabilities): void
  clearCommandErrors(): void
  addCommandError(command: string, error: Error | string): void
}

export type RazerDevice<K extends RazerCapabilityKey = never> = Omit<
  IDevice,
  'type' | 'capabilities' | 'setCapabilities'
> & {
  readonly type: 'razer'
  capabilities: RazerCapabilities<K>
  setCapabilities(capabilities: DiscoveredRazerCapabilities): void
}

export type HidppDevice<K extends HidppCapabilityKey = never> = Omit<
  IDevice,
  'type' | 'capabilities' | 'setCapabilities'
> & {
  readonly type: 'hidpp'
  capabilities: HidppCapabilities<K>
  setCapabilities(capabilities: DiscoveredHidppCapabilities): void
}

export type DeviceType = RazerDevice | HidppDevice

export type RazerCapabilities<K extends RazerCapabilityKey = never> = {
  [P in K]: RazerCapabilityClasses[P]
} & {
  [P in Exclude<RazerCapabilityKey, K>]?: RazerCapabilityClasses[P]
}

export type RazerCapabilitiesReady<K extends RazerCapabilityKey> = {
  [P in K]: RazerCapabilityClasses[P]
}

export type HidppCapabilities<K extends HidppCapabilityKey = never> = {
  [P in K]: HidppCapabilityClasses[P]
} & {
  [P in Exclude<HidppCapabilityKey, K>]?: HidppCapabilityClasses[P]
}

export type HidppCapabilitiesReady<K extends HidppCapabilityKey> = {
  [P in K]: HidppCapabilityClasses[P]
}

export type Capabilities = DiscoveredRazerCapabilities | DiscoveredHidppCapabilities

export type WithCapability<T, K> =
  T extends RazerDevice<infer Existing>
    ? K extends RazerCapabilityKey
      ? RazerDevice<Existing | K>
      : never
    : T extends HidppDevice<infer Existing>
      ? K extends HidppCapabilityKey
        ? HidppDevice<Existing | K>
        : never
      : never

export type Ready<T> =
  T extends RazerDevice<infer K>
    ? Omit<T, 'status' | 'failureReason' | 'capabilities'> & {
        status: 'Ready'
        failureReason: null
        capabilities: RazerCapabilitiesReady<K>
      }
    : T extends HidppDevice<infer K>
      ? Omit<T, 'status' | 'failureReason' | 'capabilities'> & {
          status: 'Ready'
          failureReason: null
          capabilities: HidppCapabilitiesReady<K>
        }
      : T & { status: 'Ready'; failureReason: null }

type IsReady<T> = T extends { status: 'Ready' } ? true : false
type PreserveReady<Original, Transformed> = IsReady<Original> extends true ? Ready<Transformed> : Transformed

type DeviceTypeMap = {
  razer: RazerDevice
  hidpp: HidppDevice
}

type DeviceWithCapability<Type extends 'razer' | 'hidpp', K> = {
  razer: [K] extends [RazerCapabilityKey] ? RazerDevice<K> : never
  hidpp: [K] extends [HidppCapabilityKey] ? HidppDevice<K> : never
}[Type]

type CapableOf<T, K> =
  T extends Ready<infer D extends DeviceType>
    ? D extends { type: infer Type extends 'razer' | 'hidpp' }
      ? Ready<DeviceWithCapability<Type, K>>
      : never
    : T extends DeviceType & { type: infer Type extends 'razer' | 'hidpp' }
      ? DeviceWithCapability<Type, K>
      : never

export type DeviceInStatus<S extends DeviceStatus> = (RazerDevice | HidppDevice) & { status: S }
export type DeviceInStatusVariant = DeviceInStatus<'Initializing'> | DeviceInStatus<'Ready'> | DeviceInStatus<'Failed'>

export function assertStatus<S extends DeviceStatus>(
  device: IDevice,
  status: S
): asserts device is IDevice & { status: S } {
  if (device.status !== status) {
    throw new Error(`Expected device status to be '${status}', but was '${device.status}'`)
  }
}

type InStatus<D, S extends DeviceStatus> = S extends 'Ready'
  ? D extends DeviceTypeMap[infer Type extends keyof DeviceTypeMap]
    ? Ready<DeviceTypeMap[Type]>
    : D & { status: S }
  : D & { status: S }

export function isStatus<D extends IDevice, S extends DeviceStatus>(
  device: D,
  status: S
): device is InStatus<D, S> & D {
  return device.status === status
}

export function isCapableOf<D extends RazerDevice, K extends RazerCapabilityKey>(
  device: D,
  keys: K[]
): device is CapableOf<D, K> & D
export function isCapableOf<D extends HidppDevice, K extends HidppCapabilityKey>(
  device: D,
  keys: K[]
): device is CapableOf<D, K> & D
export function isCapableOf<T extends RazerDevice | HidppDevice, K extends CapabilityKey>(
  device: T,
  keys: K[]
): device is CapableOf<T, K> & T {
  for (const key of keys) {
    if ((device.capabilities as Record<string, unknown>)[key] === undefined) {
      return false
    }
  }
  return true
}

export type ReadyRazerDeviceWithCapabilities<K extends RazerCapabilityKey> = Ready<RazerDevice<K>>

export type ReadyHidppDeviceWithCapabilities<K extends HidppCapabilityKey> = Ready<HidppDevice<K>>

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
  readonly command: string
  readonly message: string
  constructor(command: string, error: Error | string) {
    super()
    this.command = command
    if (typeof error === 'string') {
      this.message = error
    } else {
      this.name = error.name
      this.message = error.message
    }
  }
}

export class Device implements IDevice {
  @observable accessor status: DeviceStatus
  @observable accessor id: number
  @observable accessor failureReason: Error | null
  @observable accessor capabilities: Capabilities = {}
  @observable accessor commandErrors: CommandError[] = []

  readonly type: 'razer' | 'hidpp'
  readonly hid: HIDDevice
  readonly _lock: Mutex
  toastErrorsDisposer: IReactionDisposer

  constructor(hid: HIDDevice, type: 'razer' | 'hidpp') {
    this.hid = hid
    this.type = type
    this.id = (hid.vendorId << 16) + hid.productId
    this._lock = new Mutex()
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
  setCapabilities(capabilities: DiscoveredRazerCapabilities | DiscoveredHidppCapabilities) {
    this.capabilities = capabilities
  }

  @action.bound
  clearCommandErrors() {
    this.commandErrors = []
  }

  @action.bound
  addCommandError(command: string, error: Error | string) {
    this.commandErrors.push(new CommandError(command, error))
  }
}

export function isDeviceType<T extends IDevice, Type extends keyof DeviceTypeMap>(
  device: T,
  type: Type
): device is PreserveReady<T, DeviceTypeMap[Type]> & T {
  return device.type === type
}
