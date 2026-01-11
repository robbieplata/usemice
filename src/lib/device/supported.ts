import type { Effect } from 'effect'
import type { Device } from '../device/device'
import { init_dpi } from '../capabilities/dpi'
import { init_polling2 } from '../capabilities/polling2'
import { init_serial } from '../capabilities/serial'

export type SupportedDeviceInfo = Pick<Device, 'capabilities'> & {
  name: string
  vid: number
  pid: number
  init: Array<(device: Device) => Effect.Effect<Device, Error>>
}

const DEATHADDER_V4_PRO_WIRED: SupportedDeviceInfo = {
  name: 'Razer DeathAdder V4 Pro Wired',
  vid: 0x1532,
  pid: 0x00be,
  capabilities: {
    dpi: true,
    polling2: true
  },
  init: [init_serial, init_dpi, init_polling2]
}

const DEATHADDER_V4_PRO_WIRELESS: SupportedDeviceInfo = {
  ...DEATHADDER_V4_PRO_WIRED,
  name: 'Razer DeathAdder V4 Pro Wireless',
  pid: 0x00bf
}

export const SUPPORTED_DEVICE_INFO: Set<SupportedDeviceInfo> = new Set([
  DEATHADDER_V4_PRO_WIRED,
  DEATHADDER_V4_PRO_WIRELESS
])
