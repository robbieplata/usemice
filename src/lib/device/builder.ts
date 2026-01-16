import type { DeviceWithCapabilities, SupportedCapabilities } from './device'
/**
 * Static device information for supported device
 */

export type DeviceInfo<C extends keyof SupportedCapabilities = keyof SupportedCapabilities> = Pick<
  DeviceWithCapabilities<C>,
  'limits' | 'supportedCapabilities'
> & {
  name: string
  vid: number
  pid: number
}

export const defineDevice = <C extends keyof SupportedCapabilities>(info: DeviceInfo<C>): DeviceInfo<C> => info
export const deviceVariant = <C extends keyof SupportedCapabilities>(
  base: DeviceInfo<C>,
  name: string,
  pid: number
): DeviceInfo<C> => ({
  ...base,
  name,
  pid
})
