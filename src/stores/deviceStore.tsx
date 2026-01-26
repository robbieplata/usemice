import { action, computed, flow, observable, reaction, type IReactionDisposer } from 'mobx'
import { assertStatus, Device, type DeviceInStatus, type DeviceInStatusVariant } from '../lib/device/device'
import { getHidInterfaces, RequestHidDeviceError, requestHidInterface, selectBestInterface } from '../lib/device/hid'
import { toast } from 'sonner'
import type { Result } from '@/lib/result'

export class DeviceStore {
  @observable accessor devices: DeviceInStatusVariant[] = []
  @observable accessor selectedDeviceId: number | undefined
  @observable accessor errors: Error[] = []

  private reactions: IReactionDisposer[] = []

  init() {
    this.reactions.push(
      reaction(
        () => this.errors.length,
        (length, previousLength) => {
          if (length > previousLength) {
            const newError = this.errors[length - 1]
            toast.error('Error: ' + newError.message, {
              duration: 5000
            })
          }
        }
      ),
      reaction(
        () => {
          const firstDeviceId = this.devices.length > 0 ? this.devices[0].id : undefined
          const count = this.devices.length
          return { firstDeviceId, count }
        },
        (props, prev) => {
          if (props.firstDeviceId === undefined) return
          if (prev.count === 0 && props.count > 0) {
            if (this.devices.some((d) => d.id === props.firstDeviceId)) {
              this.setSelectedDeviceId(props.firstDeviceId)
            }
          }
        }
      )
    )
    navigator.hid.addEventListener('connect', this.onConnect)
    navigator.hid.addEventListener('disconnect', this.onDisconnect)
    getHidInterfaces().then((d) => {
      d.forEach(this.addDevice)
    })
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
  get selectedDevice() {
    return this.devices.find((d) => d.id === this.selectedDeviceId)
  }

  @flow.bound
  *addDevice(hid: HIDDevice) {
    if (this.devices.find((d) => d.hid.vendorId === hid.vendorId && d.hid.productId === hid.productId)) {
      return { error: new Error('Device already added') }
    }
    const device = new Device(hid)
    this.devices.push(device as DeviceInStatus<'Initializing'>)

    if (!hid.opened) {
      try {
        yield hid.open()
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Unknown error opening HID device')
        this.errors.push(error)
        return { error }
      }
    }

    const fetches: Promise<unknown>[] = []
    for (const key of Object.keys(device.profile.capabilities) as (keyof typeof device.profile.capabilities)[]) {
      fetches.push(device.get(key as any))
    }

    try {
      yield Promise.all(fetches)
      device.status = 'Ready'
      assertStatus(device, 'Ready')
    } catch (e) {
      device.status = 'Failed'
      device.failureReason = e instanceof Error ? e : new Error('Unknown error during device initialization')
      assertStatus(device, 'Failed')
    }

    if (device.failureReason) {
      this.errors.push(device.failureReason)
    }

    return { value: device }
  }

  @flow.bound
  *removeDevice(device: DeviceInStatusVariant, forget = false) {
    const index = this.devices.indexOf(device)
    if (index < 0) return
    yield device.hid.close()
    if (forget) device.hid.forget()
    this.devices.splice(index, 1)
  }

  @action.bound
  setSelectedDeviceId(id: number) {
    this.selectedDeviceId = id
  }

  @flow.bound
  *requestDevice(options?: HIDDeviceRequestOptions) {
    const hidDevice: Result<HIDDevice, RequestHidDeviceError> = yield requestHidInterface(options)
    if (hidDevice.error) {
      this.errors.push(hidDevice.error)
    }
    return hidDevice
  }
}
