import { action, computed, flow, observable, reaction, runInAction, type IReactionDisposer } from 'mobx'
import {
  assertStatus,
  Device,
  type CapabilityKey,
  type DeviceInStatus,
  type DeviceInStatusVariant
} from '../lib/device/device'
import { getHidInterfaces, RequestHidDeviceError, requestHidInterface, selectBestInterface } from '../lib/device/hid'
import { toast } from 'sonner'
import type { Result } from '@/lib/result'

const SELECTED_DEVICE_KEY = 'usemice:selectedDeviceId'

const deviceGroupKey = (d: HIDDevice) => `${d.vendorId}:${d.productId}`

export class DeviceStore {
  @observable accessor devices: DeviceInStatusVariant[] = []
  @observable accessor selectedDeviceId: number | undefined
  @observable accessor errors: Error[] = []
  @observable accessor initialized: boolean = false

  private reactions: IReactionDisposer[] = []
  private reconcileTimers = new Map<string, number>()

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
        () => this.errors.length,
        (length, previousLength) => {
          if (length > previousLength) {
            const newError = this.errors[length - 1]
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
    this.scheduleReconcilation(event.device)
  }

  onDisconnect = (event: HIDConnectionEvent) => {
    const key = deviceGroupKey(event.device)
    const existing = this.reconcileTimers.get(key)
    if (existing) {
      clearTimeout(existing)
      this.reconcileTimers.delete(key)
    }
    this.removeDevicesByGroupKey(key)
  }

  private scheduleReconcilation(device: HIDDevice) {
    const key = deviceGroupKey(device)

    const existing = this.reconcileTimers.get(key)
    if (existing) clearTimeout(existing)

    const timer = setTimeout(async () => {
      this.reconcileTimers.delete(key)

      const all = await navigator.hid.getDevices()
      const group = all.filter((d) => deviceGroupKey(d) === key)

      if (group.length === 0) {
        this.removeDevicesByGroupKey(key)
        return
      }

      const best = selectBestInterface(group)
      if (!best) return

      this.replaceInferiorInterface(key, best)
    }, 600)

    this.reconcileTimers.set(key, timer)
  }

  @action.bound
  private removeDevicesByGroupKey(key: string) {
    const toRemove = this.devices.filter((d) => deviceGroupKey(d.hid) === key)
    for (const device of toRemove) {
      device.hid.close()
      if (this.selectedDeviceId === device.id) {
        this.selectedDeviceId = undefined
      }
    }
    this.devices = this.devices.filter((d) => deviceGroupKey(d.hid) !== key)
    if (toRemove.length > 0) {
      toast.warning('Device disconnected: ' + toRemove[0].hid.productName, {
        duration: 4000
      })
    }
  }

  private replaceInferiorInterface(key: string, best: HIDDevice) {
    const existing = this.devices.find((d) => deviceGroupKey(d.hid) === key)
    if (existing && existing.hid === best) {
      return
    }
    if (existing) {
      existing.hid.close()
      if (this.selectedDeviceId === existing.id) {
        this.selectedDeviceId = undefined
      }
      runInAction(() => {
        this.devices = this.devices.filter((d) => d !== existing)
      })
    }
    this.addDevice(best)
  }

  dispose() {
    this.reactions.forEach((dispose) => dispose())
    this.reactions = []
    this.reconcileTimers.forEach((timer) => clearTimeout(timer))
    this.reconcileTimers.clear()
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
        this.errors.push(error)
        return { error }
      }
    }

    const capabilityKeys = Object.keys(device.profile.capabilities) as CapabilityKey[]
    const fetches: Promise<unknown>[] = []
    for (const key of capabilityKeys) {
      fetches.push(device.get(key))
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

  @action.bound
  setSelectedDeviceId(id: number | undefined) {
    localStorage.setItem(SELECTED_DEVICE_KEY, id !== undefined ? id.toString() : '')
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
