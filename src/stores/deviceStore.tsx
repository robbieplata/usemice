import { action, computed, flow, observable, reaction, runInAction, type IReactionDisposer } from 'mobx'
import {
  assertStatus,
  Device,
  type CapabilityKey,
  type DeviceInStatus,
  type DeviceInStatusVariant
} from '../lib/device/device'
import { getHidInterfaces, probeDevice, RequestHidDeviceError, requestHidInterface } from '../lib/device/hid'
import { toast } from 'sonner'
import type { Result } from '@/lib/result'

const SELECTED_DEVICE_KEY = 'usemice:selectedDeviceId'

export class DeviceStore {
  @observable accessor devices: DeviceInStatusVariant[] = []
  @observable accessor selectedDeviceId: number | undefined
  @observable accessor initErrors: Error[] = []
  @observable accessor initialized: boolean = false

  private reactions: IReactionDisposer[] = []
  private connectQueue: Map<string, HIDDevice[]> = new Map()
  private processingConnect = false

  init() {
    this.reactions.push(
      reaction(
        () => ({
          initialized: this.initialized,
          deviceCount: this.devices.length,
          selectedDeviceId: this.selectedDeviceId
        }),
        (state) => {
          if (!state.initialized) return
          if (state.selectedDeviceId !== undefined) return
          if (state.deviceCount === 0) return
          const storedDeviceId = localStorage.getItem(SELECTED_DEVICE_KEY)
          if (storedDeviceId) {
            const deviceId = parseInt(storedDeviceId, 10)
            if (this.devices.some((d) => d.id === deviceId)) {
              this.setSelectedDeviceId(deviceId)
              return
            }
          }
          this.setSelectedDeviceId(this.devices[0].id)
        },
        { fireImmediately: true }
      ),
      reaction(
        () => this.initErrors.length,
        (length, previousLength) => {
          if (length > previousLength) {
            const newError = this.initErrors[length - 1]
            toast.warning('Error: ' + newError.message, {
              duration: 5000
            })
          }
        }
      )
    )
    navigator.hid.addEventListener('connect', this.onConnect)
    navigator.hid.addEventListener('disconnect', this.onDisconnect)
    getHidInterfaces().then((d) => {
      d.forEach(this.addDevice)
      runInAction(() => {
        this.initialized = true
      })
    })
  }

  onConnect = (event: HIDConnectionEvent) => {
    const key = `${event.device.vendorId}:${event.device.productId}`
    const interfaces = this.connectQueue.get(key) ?? []
    interfaces.push(event.device)
    this.connectQueue.set(key, interfaces)
    this.processConnectQueue()
  }

  private processConnectQueue = async () => {
    if (this.processingConnect) return
    this.processingConnect = true

    while (this.connectQueue.size > 0) {
      const entries = [...this.connectQueue.entries()]
      this.connectQueue.clear()

      for (const [key, interfaces] of entries) {
        const [vid, pid] = key.split(':').map(Number)
        if (this.devices.some((d) => d.hid.vendorId === vid && d.hid.productId === pid)) {
          continue
        }

        for (const device of interfaces) {
          if (await probeDevice(device)) {
            this.addDevice(device)
            break
          }
        }
      }
    }

    this.processingConnect = false
  }

  onDisconnect = (event: HIDConnectionEvent) => {
    const hidDevice = event.device
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

    const result: Result<DeviceInStatusVariant, Error> = yield this.initializeDevice(device)
    return result
  }

  @flow.bound
  *removeDevice(device: DeviceInStatusVariant, forget = false) {
    const index = this.devices.indexOf(device)
    if (index < 0) return
    yield device.hid.close()
    if (forget) device.hid.forget()
    if (this.selectedDeviceId === device.id) {
      this.setSelectedDeviceId(undefined)
    }
    this.devices.splice(index, 1)
  }

  @flow.bound
  *retryDevice(device: DeviceInStatusVariant) {
    const index = this.devices.indexOf(device)
    if (index < 0) return

    device.reset()
    yield this.initializeDevice(device)
  }

  @flow.bound
  private *initializeDevice(device: Device) {
    if (!device.hid.opened) {
      try {
        yield device.hid.open()
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Unknown error opening HID device')
        device.status = 'Failed'
        device.failureReason = error
        this.initErrors.push(error)
        return { error }
      }
    }

    const capabilityKeys = Object.keys(device.capabilities) as CapabilityKey[]

    try {
      for (const key of capabilityKeys) {
        yield device.get(key)
      }
      device.status = 'Ready'
      assertStatus(device, 'Ready')
    } catch (e) {
      device.status = 'Failed'
      device.failureReason = e instanceof Error ? e : new Error('Unknown error during device initialization')
      assertStatus(device, 'Failed')
    }
    return { value: device }
  }

  @action.bound
  setSelectedDeviceId(id: number | undefined) {
    localStorage.setItem(SELECTED_DEVICE_KEY, id !== undefined ? id.toString() : '')
    this.selectedDeviceId = id
  }

  @flow.bound
  *requestDevice(options?: HIDDeviceRequestOptions) {
    const hidDevice: Result<HIDDevice, RequestHidDeviceError> = yield requestHidInterface(options)
    if (hidDevice.error) {
      this.initErrors.push(hidDevice.error)
    }
    return hidDevice
  }
}
