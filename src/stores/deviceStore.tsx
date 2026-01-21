import { action, computed, flow, observable } from 'mobx'
import { Device, isCapableOf, type IDevice, type SupportedCapabilities } from '../lib/device/device'
import {
  DeviceNotSupportedError,
  getHidInterfaces,
  identifyDevice,
  requestHidInterface,
  selectBestInterface
} from '../lib/device/hid'
import { RAZER_VID } from '../lib/device/devices'
import { DEVICE_CAPABILITIES } from '../lib/capabilities'
import { toast } from 'sonner'

export class DeviceStore {
  @observable accessor devices: IDevice[] = []
  @observable accessor selectedDeviceId: number | undefined

  constructor() {
    navigator.hid.addEventListener('connect', async (event) => {
      const hidDevice = selectBestInterface([event.device])
      if (hidDevice) {
        toast.success(`${hidDevice.productName} has been added`, {
          duration: 4000
        })
        if (!hidDevice.opened) {
          try {
            await hidDevice.open()
          } catch (e) {
            if (e instanceof Error) {
              console.error('Failed to open HID device:', e)
            } else {
              console.error('Failed to open HID device: unknown error')
            }
            toast.error('Failed to open HID device: ' + hidDevice.productName, {
              description: 'The connected HID device could not be opened.',
              duration: 4000
            })
            return
          }
        }
        this.addDevice(hidDevice)
      }
    })
    navigator.hid.addEventListener('disconnect', (event) => {
      const hidDevice = event.device
      toast.warning('Device disconnected: ' + hidDevice.productName, {
        duration: 4000
      })
      const device = this.devices.find(
        (d) => d.hid.vendorId === hidDevice.vendorId && d.hid.productId === hidDevice.productId
      )
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
    if (this.devices.find((d) => d.hid.vendorId === hid.vendorId && d.hid.productId === hid.productId)) {
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
        const fetchCommand = DEVICE_CAPABILITIES[cap].get(device)
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
  removeDevice(device: IDevice, forget = false) {
    const index = this.devices.indexOf(device)
    if (index < 0) return

    device.hid.close()
    if (forget) device.hid.forget()
    this.devices.splice(index, 1)
  }

  @action.bound
  setSelectedDeviceId(id: number) {
    this.selectedDeviceId = id
  }

  @flow.bound
  *requestDevice(options?: HIDDeviceRequestOptions) {
    return requestHidInterface(options ?? { filters: [{ vendorId: RAZER_VID }] })
  }
}
