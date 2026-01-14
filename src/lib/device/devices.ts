import type { CapabilityKey } from '../device/device'
import { defineDevice, deviceVariant, type DeviceInfo } from './builder'

export const RAZER_VID = 0x1532
export const PID_DEATHADDER_V4_PRO_WIRED = 0x00be
export const PID_DEATHADDER_V4_PRO_WIRELESS = 0x00bf

const DEATHADDER_V4_PRO_WIRED = defineDevice({
  name: 'Razer DeathAdder V4 Pro Wired',
  vid: RAZER_VID,
  pid: PID_DEATHADDER_V4_PRO_WIRED,
  supportedCapabilities: {
    dpi: true,
    dpiStages: true,
    polling: true,
    serial: true
  },
  limits: {
    dpi: { minDpi: 100, maxDpi: 45_000 },
    dpiStages: { minDpi: 100, maxDpi: 45_000, maxStages: 5 },
    polling: { supportedIntervals: [125, 250, 500, 1_000, 2_000, 4_000, 8_000] },
    serial: undefined as never
  }
})

const DEATHADDER_V4_PRO_WIRELESS = deviceVariant(
  DEATHADDER_V4_PRO_WIRED,
  'Razer DeathAdder V4 Pro Wireless',
  PID_DEATHADDER_V4_PRO_WIRELESS
)

export const SUPPORTED_DEVICE_INFO: Set<DeviceInfo<CapabilityKey>> = new Set([
  DEATHADDER_V4_PRO_WIRED,
  DEATHADDER_V4_PRO_WIRELESS
])
