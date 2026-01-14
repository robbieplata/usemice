import type { CapabilityKey, HydratedSupportedCapabilities, HydratedCapabilityLimits } from './device'
/**
 * Static device information for supported device
 */
export type DeviceInfo<C extends CapabilityKey> = {
  readonly name: string
  readonly vid: number
  readonly pid: number
  readonly supportedCapabilities: HydratedSupportedCapabilities<C>
  readonly limits: HydratedCapabilityLimits<C>
}

export const defineDevice = <C extends CapabilityKey>(info: DeviceInfo<C>): DeviceInfo<C> => info
export const deviceVariant = <C extends CapabilityKey>(
  base: DeviceInfo<C>,
  name: string,
  pid: number
): DeviceInfo<C> => ({
  ...base,
  name,
  pid
})
