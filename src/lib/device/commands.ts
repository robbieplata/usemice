import type { CapabilityData, CapabilityKey, DeviceWithCapabilities } from './device'
import { getDpi, setDpi } from '../capabilities/dpi'
import { getDpiStages } from '../capabilities/dpiStages'
import { getPolling, setPolling } from '../capabilities/polling'
import { getSerial } from '../capabilities/serial'
import { getFirmwareVersion } from '../capabilities/firmwareVersion'
import { getChargeLevel } from '../capabilities/chargeLevel'
import { getChargeStatus } from '../capabilities/chargeStatus'
import { getIdleTime, setIdleTime } from '../capabilities/idleTime'

export type CapabilityCommand<C extends CapabilityKey, T> = {
  fetch: (device: DeviceWithCapabilities<C>) => Promise<T>
  set: (device: DeviceWithCapabilities<C>, value: T) => Promise<T>
}

function createCommand<C extends CapabilityKey, T extends NonNullable<CapabilityData[C]>>(
  key: C,
  getter: (device: DeviceWithCapabilities<C>) => Promise<T>,
  setter?: (device: DeviceWithCapabilities<C>, value: T) => Promise<void>
): CapabilityCommand<C, T> {
  const command: CapabilityCommand<C, T> = {
    async fetch(device) {
      const data = await getter(device)
      device.setCapabilityData(key, data)
      return data
    },
    async set(device, value) {
      if (!setter) throw new Error(`Cannot set ${key}`)
      await setter(device, value)
      return command.fetch(device)
    }
  }
  return command
}

export const chargeLevel = createCommand('chargeLevel', getChargeLevel)
export const chargeStatus = createCommand('chargeStatus', getChargeStatus)
export const dpi = createCommand('dpi', getDpi, setDpi)
export const dpiStages = createCommand('dpiStages', getDpiStages)
export const firmwareVersion = createCommand('firmwareVersion', getFirmwareVersion)
export const idleTime = createCommand('idleTime', getIdleTime, setIdleTime)
export const polling = createCommand('polling', getPolling, setPolling)
export const serial = createCommand('serial', getSerial)

export const DEVICE_COMMANDS: { [K in CapabilityKey]: CapabilityCommand<K, NonNullable<CapabilityData[K]>> } = {
  chargeLevel: createCommand('chargeLevel', getChargeLevel),
  chargeStatus: createCommand('chargeStatus', getChargeStatus),
  dpi: createCommand('dpi', getDpi, setDpi),
  dpiStages: createCommand('dpiStages', getDpiStages),
  firmwareVersion: createCommand('firmwareVersion', getFirmwareVersion),
  idleTime: createCommand('idleTime', getIdleTime, setIdleTime),
  polling: createCommand('polling', getPolling, setPolling),
  serial: createCommand('serial', getSerial)
}
