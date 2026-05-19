import { action, computed, flow, type IReactionDisposer, observable, reaction, runInAction } from 'mobx'
import {
  assertStatus,
  Device,
  type DeviceInStatus,
  type DeviceInStatusVariant,
  type IDevice,
  isDeviceType,
} from '../lib/device/device.ts'
import { getHidInterfaces, probeDevice, RequestHidDeviceError, requestHidInterface } from '../lib/device/hid.ts'
import { toast } from 'sonner'
import type { Result } from '../lib/result.ts'
import { VID_LOGITECH } from '../lib/device/logitech/constants.ts'
import { discoverHidppCapabilities } from '../lib/device/logitech/capabilities.ts'
import { discoverRazerCapabilities } from '../lib/device/razer/capabilities.ts'
import { getEnabledMockDevices } from '../lib/device/mock/index.ts'

const SELECTED_DEVICE_KEY = 'usemice:selectedDeviceId'

export class DeviceStore {
  @observable
  accessor devices: DeviceInStatusVariant[] = []
  @observable
  accessor selectedDeviceId: number | undefined
  @observable
  accessor initErrors: Error[] = []
  @observable
  accessor initialized: boolean = false

  private reactions: IReactionDisposer[] = []
  private connectQueue: Map<string, HIDDevice[]> = new Map()
  private processingConnect = false

  init() {
    this.reactions.push(
      reaction(
        () => ({
          initialized: this.initialized,
          deviceCount: this.devices.length,
          selectedDeviceId: this.selectedDeviceId,
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
        { fireImmediately: true },
      ),
      reaction(
        () => this.initErrors.length,
        (length, previousLength) => {
          if (length > previousLength) {
            const newError = this.initErrors[length - 1]
            toast.warning('Error: ' + newError.message, {
              duration: 5000,
            })
          }
        },
      ),
    )
    navigator.hid.addEventListener('connect', this.onConnect)
    navigator.hid.addEventListener('disconnect', this.onDisconnect)
    runInAction(() => {
      for (const mock of getEnabledMockDevices()) {
        if (this.devices.some((d) => d.id === mock.id)) continue
        this.devices.push(mock as unknown as DeviceInStatus<'Ready'>)
      }
    })
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
      (d) => d.hid.vendorId === hidDevice.vendorId && d.hid.productId === hidDevice.productId,
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
    const protocol = hid.vendorId === VID_LOGITECH ? 'hidpp' : 'razer'
    const device = new Device(hid, protocol)
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
  private *initializeDevice(device: IDevice) {
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

    if (isDeviceType(device, 'razer')) {
      try {
        const capabilities: Awaited<ReturnType<typeof discoverRazerCapabilities>> = yield discoverRazerCapabilities(
          device,
        )
        device.setCapabilities(capabilities)
        device.status = 'Ready'
        assertStatus(device, 'Ready')
        return { value: device }
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Failed to discover Razer device capabilities')
        device.status = 'Failed'
        device.failureReason = error
        this.initErrors.push(error)
        return { error }
      }
    }

    if (isDeviceType(device, 'hidpp')) {
      try {
        const capabilities: Awaited<ReturnType<typeof discoverHidppCapabilities>> = yield discoverHidppCapabilities(
          device,
        )
        device.setCapabilities(capabilities)
        device.status = 'Ready'
        assertStatus(device, 'Ready')
        return { value: device }
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Failed to discover device capabilities')
        device.status = 'Failed'
        device.failureReason = error
        this.initErrors.push(error)
        return { error }
      }
    }

    // Unknown device type
    device.status = 'Failed'
    device.failureReason = new Error('Unknown device type')
    this.initErrors.push(device.failureReason)
    return { error: device.failureReason }
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
