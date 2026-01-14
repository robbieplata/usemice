import { runInAction } from 'mobx'
import type { CapabilityData, CapabilityKey, DeviceWithCapabilities } from './device'
import { getDpi, setDpi as setDpiRaw, type DpiData } from '../capabilities/dpi'
import { getDpiStages, type DpiStagesData } from '../capabilities/dpi-stages'
import { getPolling, setPolling, type PollingData } from '../capabilities/polling'
import { getSerial, type SerialData } from '../capabilities/serial'

type CapabilityCommand<C extends CapabilityKey, T> = {
  fetch: (device: DeviceWithCapabilities<C>) => Promise<T>
  set: (device: DeviceWithCapabilities<C>, value: T) => Promise<T>
}

const dpi: CapabilityCommand<'dpi', DpiData> = {
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

const dpiStages: CapabilityCommand<'dpiStages', DpiStagesData> = {
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

const polling: CapabilityCommand<'polling', PollingData> = {
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

const serial: CapabilityCommand<'serial', SerialData> = {
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

export const DEVICE_COMMANDS: { [K in CapabilityKey]: CapabilityCommand<K, NonNullable<CapabilityData[K]>> } = {
  dpi,
  dpiStages,
  polling,
  serial
}

export { dpi, dpiStages, polling, serial }
