import { action, computed, flow, observable } from 'mobx'
import { Device, isCapableOf, type IDevice, type SupportedCapabilities } from '../lib/device/device'
import { DeviceNotSupportedError, getHidInterfaces, identifyDevice, requestHidInterface } from '../lib/device/hid'
import { RAZER_VID } from '../lib/device/devices'
import { DEVICE_COMMANDS } from '../lib/device/commands'

export class DeviceStore {
  @observable accessor devices: IDevice[] = []
  @observable accessor selectedDeviceId: number | undefined

  constructor() {
    navigator.hid.addEventListener('connect', (event) => {
      const hidDevice = event.device
      console.log('HID device connected:', hidDevice.productName)
      this.addDevice(hidDevice)
    })
    navigator.hid.addEventListener('disconnect', (event) => {
      const hidDevice = event.device
      console.log('HID device disconnected:', hidDevice.productName)
      const device = this.devices.find((d) => d.hid === hidDevice)
      if (device) {
        this.removeDevice(device)
      }
    })
    getHidInterfaces()
      .then((results) => {
        results.forEach((result) => {
          if (result.error) {
            console.error('Failed to get HID interfaces for a device:', result.error)
            return
          }
          this.addDevice(result.value)
        })
      })
      .catch((error) => {
        console.error('Error while getting HID interfaces:', error)
      })
  }

  @computed
  get selectedDevice(): IDevice | undefined {
    return this.devices.find((d) => d.id === this.selectedDeviceId)
  }

  @flow.bound
  *addDevice(hid: HIDDevice) {
    if (this.devices.find((d) => d.hid === hid)) {
      return { error: new Error('Device already added') }
    }

    const deviceInfo = identifyDevice(hid)
    if (!deviceInfo) {
      return { error: new DeviceNotSupportedError(hid.vendorId, hid.productId) }
    }
    const device = new Device(deviceInfo, hid)
    const supportedCapabilities = Object.keys(device.supportedCapabilities) as (keyof SupportedCapabilities)[]
    const fetchCommands = []
    for (const cap of supportedCapabilities) {
      if (isCapableOf(device, [cap])) {
        const fetchCommand = DEVICE_COMMANDS[cap].fetch(device)
        fetchCommands.push(fetchCommand)
      }
    }

    try {
      yield Promise.all(fetchCommands)
      device.status = 'Ready'
    } catch (e) {
      device.status = 'Failed'
      if (e instanceof Error) {
        device.error = e
      } else {
        device.error = new Error('Unknown error during device initialization')
      }
    }

    this.devices.push(device)
    return { value: device }
  }

  @action.bound
  removeDevice(device: IDevice) {
    const index = this.devices.indexOf(device)
    if (index < 0) return

    device.hid.close()
    device.hid.forget()
    this.devices.splice(index, 1)
  }

  @action.bound
  setSelectedDeviceId(id: number) {
    console.log('Setting selected device ID to', id)
    this.selectedDeviceId = id
  }

  @flow.bound
  *requestDevice(options?: HIDDeviceRequestOptions) {
    return requestHidInterface(options ?? { filters: [{ vendorId: RAZER_VID }] })
  }
}
