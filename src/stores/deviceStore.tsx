import { action, computed, flow, observable, reaction, type IReactionDisposer } from 'mobx'
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
  @observable accessor errors: Error[] = []
  private reactions: IReactionDisposer[] = []

  constructor() {
    this.reactions.push(
      reaction(
        () => this.errors.length,
        (length, previousLength) => {
          if (length > previousLength) {
            const newError = this.errors[length - 1]
            toast.error('Device Store Error: ' + newError.message, {
              duration: 4000
            })
          }
        }
      )
    )
    navigator.hid.addEventListener('connect', this.onConnect)
    navigator.hid.addEventListener('disconnect', this.onDisconnect)
    getHidInterfaces().then((d) => d.map(this.addDevice))
  }

  onConnect = async (event: HIDConnectionEvent) => {
    const hidDevice = selectBestInterface([event.device])
    if (hidDevice) {
      this.addDevice(hidDevice)
    }
  }

  onDisconnect = async (event: HIDConnectionEvent) => {
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
  }

  dispose() {
    this.reactions.forEach((dispose) => dispose())
    this.reactions = []
    navigator.hid.removeEventListener('connect', this.onConnect)
    navigator.hid.removeEventListener('disconnect', this.onDisconnect)
  }

  @computed
  get selectedDevice(): IDevice | undefined {
    return this.devices.find((d) => d.id === this.selectedDeviceId)
  }

  @flow.bound
  *addDevice(hid: HIDDevice) {
    const loadingToast = toast.loading(`Adding device: ${hid.productName}`, {
      duration: 2000
    })
    if (this.devices.find((d) => d.hid.vendorId === hid.vendorId && d.hid.productId === hid.productId)) {
      return { error: new Error('Device already added') }
    }
    const deviceInfo = identifyDevice(hid)
    if (!deviceInfo) {
      return { error: new DeviceNotSupportedError(hid.vendorId, hid.productId) }
    }
    const device = new Device(deviceInfo, hid)
    this.devices.push(device)

    if (!hid.opened) {
      try {
        yield hid.open()
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Unknown error opening HID device')
        this.errors.push(error)
        toast.dismiss(loadingToast)
        return { error }
      }
    }
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
    } finally {
      toast.dismiss(loadingToast)
    }

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
