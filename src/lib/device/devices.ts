import { chargeLevel } from '../capabilities/razer/chargeLevel'
import { chargeStatus } from '../capabilities/razer/chargeStatus'
import { dongleLedMulti } from '../capabilities/razer/dongleLedMulti'
import { dpi } from '../capabilities/razer/dpi'
import { dpiStages } from '../capabilities/razer/dpiStages'
import { firmwareVersion } from '../capabilities/razer/firmwareVersion'
import { idleTime } from '../capabilities/razer/idleTime'
import { polling } from '../capabilities/razer/polling'
import { polling2 } from '../capabilities/razer/polling2'
import { serial } from '../capabilities/razer/serial'
import { type CapabilityEntry, type CapabilityKey } from './device'

export type DeviceProfile = {
  capabilities: Partial<{ [K in CapabilityKey]: CapabilityEntry<K> }>
}

export const RAZER_VID = 0x1532
export const PID_DEATHADDER_V4_PRO_WIRED = 0x00be
export const PID_DEATHADDER_V4_PRO_WIRELESS = 0x00bf
export const PID_DEATHADDER_V3_PRO_WIRED_ALT = 0x00c2
export const PID_DEATHADDER_V3_PRO_WIRELESS_ALT = 0x00c3

class UnsupportedDeviceError extends Error {
  constructor(vid: number, pid: number) {
    super(`Unsupported device VID: ${vid.toString(16)}, PID: ${pid.toString(16)}`)
    this.name = 'UnsupportedDeviceError'
  }
}

export function getDeviceProfile(vid: number, pid: number): DeviceProfile | null {
  switch (vid) {
    case RAZER_VID:
      switch (pid) {
        case PID_DEATHADDER_V4_PRO_WIRED:
        case PID_DEATHADDER_V4_PRO_WIRELESS:
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 45_000 }, command: dpi },
              dpiStages: {
                info: { minDpi: 100, maxDpi: 45_000, maxStages: 5 },
                command: dpiStages
              },
              polling2: {
                info: { supportedIntervals: [125, 250, 500, 1_000, 2_000, 4_000, 8_000], idByte: 0x1f },
                command: polling2
              },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900 }, command: idleTime },
              chargeLevel: { command: chargeLevel, info: {} },
              chargeStatus: { command: chargeStatus, info: {} },
              firmwareVersion: { command: firmwareVersion, info: {} },
              serial: { command: serial, info: {} },
              dongleLedMulti: { command: dongleLedMulti, info: {} }
            }
          }
        case PID_DEATHADDER_V3_PRO_WIRED_ALT:
        case PID_DEATHADDER_V3_PRO_WIRELESS_ALT:
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 45_000 }, command: dpi },
              dpiStages: {
                info: { minDpi: 100, maxDpi: 45_000, maxStages: 5 },
                command: dpiStages
              },
              polling: {
                info: { supportedIntervals: [125, 500, 1_000], idByte: 0x1f },
                command: polling
              },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900 }, command: idleTime },
              chargeLevel: { command: chargeLevel, info: {} },
              chargeStatus: { command: chargeStatus, info: {} },
              firmwareVersion: { command: firmwareVersion, info: {} },
              serial: { command: serial, info: {} }
            }
          }
      }
  }
  throw new UnsupportedDeviceError(vid, pid)
}
