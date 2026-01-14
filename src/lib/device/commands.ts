import { runInAction } from 'mobx'
import type { CapabilityData, CapabilityKey, DeviceWithCapabilities } from './device'
import { getDpi, setDpi as setDpiRaw, type DpiData } from '../capabilities/dpi'
import { getDpiStages, type DpiStagesData } from '../capabilities/dpiStages'
import { getPolling, setPolling, type PollingData } from '../capabilities/polling'
import { getSerial, type SerialData } from '../capabilities/serial'
import { getFirmwareVersion, type FirmwareVersionData } from '../capabilities/firmwareVersion'
import { getChargeLevel, type ChargeLevelData } from '../capabilities/chargeLevel'
import { getChargeStatus, type ChargeStatusData } from '../capabilities/chargeStatus'
import { getIdleTime, setIdleTime, type IdleTimeData } from '../capabilities/idleTime'

type CapabilityCommand<C extends CapabilityKey, T> = {
  fetch: (device: DeviceWithCapabilities<C>) => Promise<T>
  set: (device: DeviceWithCapabilities<C>, value: T) => Promise<T>
}

export const dpi: CapabilityCommand<'dpi', DpiData> = {
  async fetch(device: DeviceWithCapabilities<'dpi'>) {
    const data = await getDpi(device)
    runInAction(() => {
      device.capabilityData.dpi = data
    })
    return data
  },

  async set(device: DeviceWithCapabilities<'dpi'>, data: DpiData) {
    await setDpiRaw(device, data)
    return await this.fetch(device)
  }
}

export const dpiStages: CapabilityCommand<'dpiStages', DpiStagesData> = {
  async fetch(device: DeviceWithCapabilities<'dpiStages'>) {
    const data = await getDpiStages(device)
    runInAction(() => {
      device.capabilityData.dpiStages = data
    })
    return data
  },

  async set(_device: DeviceWithCapabilities<'dpiStages'>, _data: DpiStagesData) {
    throw new Error('Not implemented')
  }
}

export const polling: CapabilityCommand<'polling', PollingData> = {
  async fetch(device: DeviceWithCapabilities<'polling'>) {
    const data = await getPolling(device)
    runInAction(() => {
      device.capabilityData.polling = data
    })
    return data
  },

  async set(device: DeviceWithCapabilities<'polling'>, data: PollingData) {
    await setPolling(device, data)
    return await this.fetch(device)
  }
}

export const serial: CapabilityCommand<'serial', SerialData> = {
  async fetch(device: DeviceWithCapabilities<'serial'>) {
    const data = await getSerial(device)
    runInAction(() => {
      device.capabilityData.serial = data
    })
    return data
  },
  async set(_device: DeviceWithCapabilities<'serial'>, _data: SerialData) {
    throw new Error('Cannot set serial number')
  }
}

export const firmwareVersion: CapabilityCommand<'firmwareVersion', FirmwareVersionData> = {
  async fetch(device: DeviceWithCapabilities<'firmwareVersion'>) {
    const data: FirmwareVersionData = await getFirmwareVersion(device)
    runInAction(() => {
      device.capabilityData.firmwareVersion = data
    })
    return data
  },
  async set(_device: DeviceWithCapabilities<'firmwareVersion'>, _data: FirmwareVersionData) {
    throw new Error('Not implemented')
  }
}

export const chargeLevel: CapabilityCommand<'chargeLevel', ChargeLevelData> = {
  async fetch(device: DeviceWithCapabilities<'chargeLevel'>) {
    const chargeLevel = await getChargeLevel(device)
    runInAction(() => {
      device.capabilityData.chargeLevel = chargeLevel
    })
    return chargeLevel
  },
  async set(_device: DeviceWithCapabilities<'chargeLevel'>, _data: ChargeLevelData) {
    throw new Error('Not implemented')
  }
}

export const chargeStatus: CapabilityCommand<'chargeStatus', ChargeStatusData> = {
  async fetch(device: DeviceWithCapabilities<'chargeStatus'>) {
    const chargeStatus = await getChargeStatus(device)
    runInAction(() => {
      device.capabilityData.chargeStatus = chargeStatus
    })
    return chargeStatus
  },
  async set(_device: DeviceWithCapabilities<'chargeStatus'>, _data: ChargeStatusData) {
    throw new Error('Not implemented')
  }
}

export const idleTime: CapabilityCommand<'idleTime', IdleTimeData> = {
  async fetch(device: DeviceWithCapabilities<'idleTime'>) {
    const idleTime = await getIdleTime(device)
    runInAction(() => {
      device.capabilityData.idleTime = idleTime
    })
    return idleTime
  },
  async set(device: DeviceWithCapabilities<'idleTime'>, data: IdleTimeData) {
    await setIdleTime(device, data)
    return await this.fetch(device)
  }
}

export const DEVICE_COMMANDS: { [K in CapabilityKey]: CapabilityCommand<K, NonNullable<CapabilityData[K]>> } = {
  chargeLevel,
  chargeStatus,
  dpi,
  dpiStages,
  firmwareVersion,
  idleTime,
  polling,
  serial
}
