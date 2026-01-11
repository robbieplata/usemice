import type { Effect } from 'effect'
import type { CapabilityKey, Device, DeviceWithCapabilities } from '../device/device'
import { init_dpi } from '../capabilities/dpi'
import { init_polling2 } from '../capabilities/polling2'
import { init_serial } from '../capabilities/serial'

type StaticSupportedDeviceInfo = {
  readonly name: string
  readonly vid: number
  readonly pid: number
  init: Array<(device: Device) => Effect.Effect<Device, Error>>
}

export type SupportedDeviceInfo<T extends CapabilityKey> = StaticSupportedDeviceInfo &
  Pick<DeviceWithCapabilities<T>, 'capabilities' | 'limits'>

const DEATHADDER_V4_PRO_WIRED: SupportedDeviceInfo<'dpi' | 'polling2' | 'serial'> = {
  name: 'Razer DeathAdder V4 Pro Wired',
  vid: 0x1532,
  pid: 0x00be,
  capabilities: {
    serial: true,
    dpi: true,
    polling2: true
  },
  limits: {
    serial: {},
    dpi: {
      minDpi: 100,
      maxDpi: 45_000,
      maxStages: 5
    },
    polling2: {
      supportedIntervals: [125, 250, 500, 1000, 2000, 4000, 8000]
    }
  },
  init: [init_serial, init_dpi, init_polling2]
}

const DEATHADDER_V4_PRO_WIRELESS: SupportedDeviceInfo<'dpi' | 'polling2' | 'serial'> = {
  ...DEATHADDER_V4_PRO_WIRED,
  name: 'Razer DeathAdder V4 Pro Wireless',
  pid: 0x00bf
}

export const SUPPORTED_DEVICE_INFO: Set<SupportedDeviceInfo<CapabilityKey>> = new Set([
  DEATHADDER_V4_PRO_WIRED,
  DEATHADDER_V4_PRO_WIRELESS
])
