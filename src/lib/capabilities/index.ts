import type { CapabilityData, DeviceWithCapabilities, SupportedCapabilities } from '../device/device'
import { getDpi, setDpi } from '../capabilities/dpi'
import { getDpiStages } from '../capabilities/dpiStages'
import { getPolling, setPolling } from '../capabilities/polling'
import { getSerial } from '../capabilities/serial'
import { getFirmwareVersion } from '../capabilities/firmwareVersion'
import { getChargeLevel } from '../capabilities/chargeLevel'
import { getChargeStatus } from '../capabilities/chargeStatus'
import { getIdleTime, setIdleTime } from '../capabilities/idleTime'

export type CapabilityCommand<C extends keyof SupportedCapabilities, T> = {
  get: (device: DeviceWithCapabilities<C>) => Promise<T>
  set: (device: DeviceWithCapabilities<C>, value: T) => Promise<T>
}

function createCapability<C extends keyof SupportedCapabilities, T extends CapabilityData[C]>(
  key: C,
  getter: (device: DeviceWithCapabilities<C>) => Promise<T>,
  setter?: (device: DeviceWithCapabilities<C>, value: T) => Promise<void>
): CapabilityCommand<C, T> {
  const command: CapabilityCommand<C, T> = {
    async get(device) {
      const data = await getter(device)
      device.setCapabilityData(key, data)
      return data
    },
    async set(device, value) {
      if (!setter) throw new Error(`Cannot set ${key}`)
      await setter(device, value)
      return await command.get(device)
    }
  }
  return command
}

export const chargeLevel = createCapability('chargeLevel', getChargeLevel)
export const chargeStatus = createCapability('chargeStatus', getChargeStatus)
export const dpi = createCapability('dpi', getDpi, setDpi)
export const dpiStages = createCapability('dpiStages', getDpiStages)
export const firmwareVersion = createCapability('firmwareVersion', getFirmwareVersion)
export const idleTime = createCapability('idleTime', getIdleTime, setIdleTime)
export const polling = createCapability('polling', getPolling, setPolling)
export const serial = createCapability('serial', getSerial)

export const DEVICE_CAPABILITIES: {
  [K in keyof SupportedCapabilities]: CapabilityCommand<K, NonNullable<CapabilityData[K]>>
} = {
  chargeLevel,
  chargeStatus,
  dpi,
  dpiStages,
  firmwareVersion,
  idleTime,
  polling,
  serial
}
