import type { Device } from '../device/device'

export type SupportedDevice = Pick<Device, 'capabilities'> & {
  model: string
  vid: number
  pid: number
}

export const SUPPORTED_DEVICES = new Set([
  {
    model: 'Razer DeathAdder V4 Pro Wired',
    vid: 0x1532,
    pid: 0x00be,
    capabilities: {
      dpi: true,
      polling2: true
    }
  },
  {
    model: 'Razer DeathAdder V4 Pro Wireless',
    vid: 0x1532,
    pid: 0x00bf,
    capabilities: {
      dpi: true,
      polling2: true
    }
  }
])
