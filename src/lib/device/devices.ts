import { defineDevice, deviceVariant, type DeviceInfo } from './builder'

export const RAZER_VID = 0x1532
export const PID_DEATHADDER_V4_PRO_WIRED = 0x00be
export const PID_DEATHADDER_V4_PRO_WIRELESS = 0x00bf
export const PID_DEATHADDER_V3_PRO_WIRED_ALT = 0x00c2
export const PID_DEATHADDER_V3_PRO_WIRELESS_ALT = 0x00c3

const DEATHADDER_V4_PRO_WIRED = defineDevice({
  vid: RAZER_VID,
  pid: PID_DEATHADDER_V4_PRO_WIRED,
  supportedCapabilities: {
    dpi: true,
    dpiStages: true,
    dongleLedMulti: true,
    polling: false,
    polling2: true,
    serial: true,
    firmwareVersion: true,
    chargeLevel: true,
    chargeStatus: true,
    idleTime: false
  },
  capabilityInfo: {
    dpi: { minDpi: 100, maxDpi: 45_000 },
    dpiStages: { minDpi: 100, maxDpi: 45_000, maxStages: 5 },
    dongleLedMulti: undefined as never,
    polling: undefined as never,
    polling2: { supportedIntervals: [125, 250, 500, 1_000, 2_000, 4_000, 8_000], idByte: 0x1f },
    serial: undefined as never,
    firmwareVersion: undefined as never,
    chargeLevel: undefined as never,
    chargeStatus: undefined as never,
    idleTime: {
      minSeconds: 60,
      maxSeconds: 900
    }
  }
})

const DEATHADDER_V3_PRO_WIRED_ALT = defineDevice({
  vid: RAZER_VID,
  pid: PID_DEATHADDER_V3_PRO_WIRED_ALT,
  supportedCapabilities: {
    dpi: true,
    dpiStages: true,
    dongleLedMulti: false,
    polling: true,
    polling2: false,
    serial: true,
    firmwareVersion: true,
    chargeLevel: true,
    chargeStatus: true,
    idleTime: true
  },
  capabilityInfo: {
    dpi: { minDpi: 100, maxDpi: 45_000 },
    dpiStages: { minDpi: 100, maxDpi: 45_000, maxStages: 5 },
    dongleLedMulti: undefined as never,
    polling: { supportedIntervals: [125, 500, 1_000], idByte: 0x1f },
    polling2: undefined as never,
    serial: undefined as never,
    firmwareVersion: undefined as never,
    chargeLevel: undefined as never,
    chargeStatus: undefined as never,
    idleTime: {
      minSeconds: 60,
      maxSeconds: 900
    }
  }
})

const DEATHADDER_V3_PRO_WIRELESS_ALT = deviceVariant(DEATHADDER_V3_PRO_WIRED_ALT, PID_DEATHADDER_V3_PRO_WIRELESS_ALT)
const DEATHADDER_V4_PRO_WIRELESS = deviceVariant(DEATHADDER_V4_PRO_WIRED, PID_DEATHADDER_V4_PRO_WIRELESS)

export const SUPPORTED_DEVICE_INFO: Set<DeviceInfo> = new Set([
  DEATHADDER_V4_PRO_WIRED,
  DEATHADDER_V4_PRO_WIRELESS,
  DEATHADDER_V3_PRO_WIRED_ALT,
  DEATHADDER_V3_PRO_WIRELESS_ALT
])
