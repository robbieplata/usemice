import { action, observable, reaction, type IReactionDisposer } from 'mobx'
import { Mutex } from '../mutex'
import { toast } from 'sonner'
import { type DiscoveredRazerCapabilities, type RazerCapabilityKey, type RazerCapabilityClasses } from './razer'

export type DeviceStatus = 'Initializing' | 'Ready' | 'Failed'
export type CapabilityKey = RazerCapabilityKey

export type IDevice = {
  readonly hid: HIDDevice
  readonly _lock: Mutex
  id: number
  status: DeviceStatus
  failureReason: Error | null
  capabilities: DiscoveredRazerCapabilities
  commandErrors: CommandError[]
  reset(): void
  setCapabilities(capabilities: DiscoveredRazerCapabilities): void
  clearCommandErrors(): void
  addCommandError(command: string, error: Error | string): void
}

export type RazerDevice<K extends RazerCapabilityKey = never> = IDevice & {
  capabilities: RazerCapabilities<K>
}

export type RazerCapabilities<K extends RazerCapabilityKey = never> = {
  [P in K]: RazerCapabilityClasses[P]
} & {
  [P in Exclude<RazerCapabilityKey, K>]?: RazerCapabilityClasses[P]
}

export type RazerCapabilitiesReady<K extends RazerCapabilityKey> = {
  [P in K]: RazerCapabilityClasses[P]
}

export type Capabilities = DiscoveredRazerCapabilities

export type Ready<T> =
  T extends RazerDevice<infer K>
    ? Omit<T, 'status' | 'failureReason' | 'capabilities'> & {
        status: 'Ready'
        failureReason: null
        capabilities: RazerCapabilitiesReady<K>
      }
    : T & { status: 'Ready'; failureReason: null }

type CapableOf<T, K> =
  T extends Ready<RazerDevice>
    ? [K] extends [RazerCapabilityKey]
      ? Ready<RazerDevice<K>>
      : never
    : T extends RazerDevice
      ? [K] extends [RazerCapabilityKey]
        ? RazerDevice<K>
        : never
      : never

export type DeviceInStatus<S extends DeviceStatus> = RazerDevice & {
  status: S
  failureReason: S extends 'Failed' ? Error : null
}
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
  ? D extends RazerDevice
    ? Ready<RazerDevice>
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
): device is CapableOf<D, K> & D {
  for (const key of keys) {
    if ((device.capabilities as Record<string, unknown>)[key] === undefined) {
      return false
    }
  }
  return true
}

export type ReadyRazerDeviceWithCapabilities<K extends RazerCapabilityKey> = Ready<RazerDevice<K>>

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

  readonly hid: HIDDevice
  readonly _lock: Mutex
  toastErrorsDisposer: IReactionDisposer

  constructor(hid: HIDDevice) {
    this.hid = hid
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
  setCapabilities(capabilities: DiscoveredRazerCapabilities) {
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
