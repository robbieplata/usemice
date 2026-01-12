import type { CapabilityKey, Device, HydratedSupportedCapabilities, HydratedCapabilityLimits } from './device'

export type Adapter<K extends CapabilityKey, TLimits = {}, TMethods = {}> = {
  readonly key: K
  readonly limits: TLimits
  readonly init: (device: Device) => Promise<Device>
  readonly methods: (device: Device) => TMethods
}

export type Adapters = readonly Adapter<CapabilityKey, unknown, unknown>[]

export type AdaptersKeys<T extends Adapters> = T[number] extends Adapter<infer K, unknown, unknown> ? K : never

type MethodsFactory = (device: Device) => unknown

export type DeviceDefinition<C extends CapabilityKey> = {
  readonly name: string
  readonly vid: number
  readonly pid: number
  readonly supportedCapabilities: HydratedSupportedCapabilities<C>
  readonly limits: HydratedCapabilityLimits<C>
  readonly init: Array<(device: Device) => Promise<Device>>
  readonly methodFactories: Record<string, MethodsFactory>
}

export class DeviceBuilder<T extends Adapters = []> {
  private constructor(
    private readonly name: string,
    private readonly vid: number,
    private readonly pid: number,
    private readonly adapters: T
  ) {}

  static create(name: string, vid: number, pid: number): DeviceBuilder<[]> {
    return new DeviceBuilder(name, vid, pid, [])
  }

  with<K extends CapabilityKey, TLimits, TMethods>(
    adapter: Adapter<K, TLimits, TMethods>
  ): DeviceBuilder<readonly [...T, Adapter<K, TLimits, TMethods>]> {
    return new DeviceBuilder(this.name, this.vid, this.pid, [...this.adapters, adapter] as const)
  }

  build(): DeviceDefinition<AdaptersKeys<T> & CapabilityKey> {
    const supportedCapabilities = {} as Record<string, true>
    const limits = {} as Record<string, unknown>
    const init: Array<(device: Device) => Promise<Device>> = []
    const methodFactories = {} as Record<string, MethodsFactory>

    for (const adapter of this.adapters) {
      supportedCapabilities[adapter.key] = true
      limits[adapter.key] = adapter.limits
      init.push(adapter.init)
      methodFactories[adapter.key] = adapter.methods
    }

    return {
      name: this.name,
      vid: this.vid,
      pid: this.pid,
      supportedCapabilities,
      limits,
      init,
      methodFactories
    } as DeviceDefinition<AdaptersKeys<T> & CapabilityKey>
  }

  variant(name: string, pid: number): DeviceDefinition<AdaptersKeys<T> & CapabilityKey> {
    const base = this.build()
    return {
      ...base,
      name,
      pid
    }
  }
}
