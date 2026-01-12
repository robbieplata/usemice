import type { Effect } from 'effect'
import type { CapabilityKey, Device, KnownCapabilities, KnownCapabilityLimits } from './device'

export type Adapter<K extends string, TLimits = {}> = {
  readonly key: K
  readonly limits: TLimits
  readonly init: (device: Device) => Effect.Effect<Device, Error>
}

export type Adapters = readonly Adapter<string, unknown>[]

export type AdaptersKeys<T extends Adapters> = T[number] extends Adapter<infer K, unknown> ? K : never

export type DeviceDefinition<C extends CapabilityKey> = {
  readonly name: string
  readonly vid: number
  readonly pid: number
  readonly capabilities: KnownCapabilities<C>
  readonly limits: KnownCapabilityLimits<C>
  readonly init: Array<(device: Device) => Effect.Effect<Device, Error>>
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

  with<K extends string, TLimits>(adapter: Adapter<K, TLimits>): DeviceBuilder<readonly [...T, Adapter<K, TLimits>]> {
    return new DeviceBuilder(this.name, this.vid, this.pid, [...this.adapters, adapter] as const)
  }

  build(): DeviceDefinition<AdaptersKeys<T> & CapabilityKey> {
    const capabilities = {} as Record<string, true>
    const limits = {} as Record<string, unknown>
    const init: Array<(device: Device) => Effect.Effect<Device, Error>> = []

    for (const adapter of this.adapters) {
      capabilities[adapter.key] = true
      limits[adapter.key] = adapter.limits
      init.push(adapter.init)
    }

    return {
      name: this.name,
      vid: this.vid,
      pid: this.pid,
      capabilities,
      limits,
      init
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
