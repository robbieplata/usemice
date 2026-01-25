import { type DeviceProfile } from './device'

export const RAZER_VID = 0x1532
export const PID_DEATHADDER_V4_PRO_WIRED = 0x00be
export const PID_DEATHADDER_V4_PRO_WIRELESS = 0x00bf
export const PID_DEATHADDER_V3_PRO_WIRED_ALT = 0x00c2
export const PID_DEATHADDER_V3_PRO_WIRELESS_ALT = 0x00c3

export function getDeviceProfile(vid: number, pid: number): DeviceProfile | null {
  switch (vid) {
    case RAZER_VID:
      switch (pid) {
        case PID_DEATHADDER_V4_PRO_WIRED:
        case PID_DEATHADDER_V4_PRO_WIRELESS:
          return {
            capabilityInfo: {
              dpi: { minDpi: 100, maxDpi: 45_000 },
              dpiStages: { minDpi: 100, maxDpi: 45_000, maxStages: 5 },
              dongleLedMulti: undefined,
              polling2: { supportedIntervals: [125, 250, 500, 1_000, 2_000, 4_000, 8_000], idByte: 0x1f },
              serial: undefined,
              firmwareVersion: undefined,
              chargeLevel: undefined,
              chargeStatus: undefined,
              idleTime: { minSeconds: 60, maxSeconds: 900 }
            }
          }
        case PID_DEATHADDER_V3_PRO_WIRED_ALT:
        case PID_DEATHADDER_V3_PRO_WIRELESS_ALT:
          return {
            capabilityInfo: {
              dpi: { minDpi: 100, maxDpi: 45_000 },
              dpiStages: { minDpi: 100, maxDpi: 45_000, maxStages: 5 },
              polling: { supportedIntervals: [125, 500, 1_000], idByte: 0x1f },
              serial: undefined,
              firmwareVersion: undefined,
              chargeLevel: undefined,
              chargeStatus: undefined,
              idleTime: { minSeconds: 60, maxSeconds: 900 }
            }
          }
        default:
          return null
      }
    default:
      return null
  }
}
