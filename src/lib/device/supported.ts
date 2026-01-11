import type { Device } from '../device/device'

export type SupportedDeviceInfo = Pick<Device, 'capabilities'> & {
  name: string
  vid: number
  pid: number
  interfaceNumber: number
}

export const SUPPORTED_DEVICE_INFO: Set<SupportedDeviceInfo> = new Set([
  {
    name: 'Razer DeathAdder V4 Pro Wired',
    vid: 0x1532,
    pid: 0x00be,
    interfaceNumber: 0,
    capabilities: {
      dpi: true,
      polling2: true
    }
  },
  {
    name: 'Razer DeathAdder V4 Pro Wireless',
    vid: 0x1532,
    pid: 0x00bf,
    interfaceNumber: 0,
    capabilities: {
      dpi: true,
      polling2: true
    }
  }
])
