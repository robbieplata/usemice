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

export const PID_OROCHI2011 = 0x0013
export const PID_NAGA = 0x0015
export const PID_NAGA_EPIC = 0x001f
export const PID_ABYSSUS1800 = 0x0020
export const PID_MAMBA2012_WIRED = 0x0024
export const PID_MAMBA2012_WIRELESS = 0x0025
export const PID_NAGA2012 = 0x002e
export const PID_IMPERATOR = 0x002f
export const PID_OUROBOROS = 0x0032
export const PID_TAIPAN = 0x0034
export const PID_NAGA_HEX_RED = 0x0036
export const PID_DEATHADDER2013 = 0x0037
export const PID_DEATHADDER1800 = 0x0038
export const PID_OROCHI2013 = 0x0039
export const PID_NAGA_EPIC_CHROMA_WIRED = 0x003e
export const PID_NAGA_EPIC_CHROMA_WIRELESS = 0x003f
export const PID_NAGA2014 = 0x0040
export const PID_NAGA_HEX = 0x0041
export const PID_ABYSSUS = 0x0042
export const PID_DEATHADDER_CHROMA = 0x0043
export const PID_MAMBA_TE = 0x0046
export const PID_OROCHI_WIRED = 0x0048
export const PID_DIAMONDBACK_CHROMA = 0x004c
export const PID_DEATHADDER2000 = 0x004f
export const PID_NAGA_HEX_V2 = 0x0050
export const PID_NAGA_CHROMA = 0x0053
export const PID_DEATHADDER3500 = 0x0054
export const PID_LANCEHEAD_WIRED = 0x0059
export const PID_LANCEHEAD_WIRELESS = 0x005a
export const PID_ABYSSUS_V2 = 0x005b
export const PID_DEATHADDER_ELITE = 0x005c
export const PID_ABYSSUS2000 = 0x005e
export const PID_LANCEHEAD_TE = 0x0060
export const PID_ATHERIS_RECEIVER = 0x0062
export const PID_BASILISK = 0x0064
export const PID_BASILISK_ESSENTIAL = 0x0065
export const PID_NAGA_TRINITY = 0x0067
export const PID_ABYSSUS_ELITE_DVA_EDITION = 0x006a
export const PID_ABYSSUS_ESSENTIAL = 0x006b
export const PID_MAMBA_ELITE = 0x006c
export const PID_DEATHADDER_ESSENTIAL = 0x006e
export const PID_LANCEHEAD_WIRELESS_RECEIVER = 0x006f
export const PID_LANCEHEAD_WIRELESS_WIRED = 0x0070
export const PID_DEATHADDER_ESSENTIAL_WHITE_EDITION = 0x0071
export const PID_MAMBA_WIRELESS_RECEIVER = 0x0072
export const PID_MAMBA_WIRELESS_WIRED = 0x0073
export const PID_PRO_CLICK_RECEIVER = 0x0077
export const PID_VIPER = 0x0078
export const PID_VIPER_ULTIMATE_WIRED = 0x007a
export const PID_VIPER_ULTIMATE_WIRELESS = 0x007b
export const PID_DEATHADDER_V2_PRO_WIRED = 0x007c
export const PID_DEATHADDER_V2_PRO_WIRELESS = 0x007d
export const PID_PRO_CLICK_WIRED = 0x0080
export const PID_BASILISK_XHYPER_SPEED = 0x0083
export const PID_DEATHADDER_V2 = 0x0084
export const PID_BASILISK_V2 = 0x0085
export const PID_BASILISK_ULTIMATE_WIRED = 0x0086
export const PID_BASILISK_ULTIMATE_RECEIVER = 0x0088
export const PID_VIPER_MINI = 0x008a
export const PID_DEATHADDER_V2_MINI = 0x008c
export const PID_NAGA_LEFT_HANDED2020 = 0x008d
export const PID_NAGA_PRO_WIRED = 0x008f
export const PID_NAGA_PRO_WIRELESS = 0x0090
export const PID_VIPER8_KHZ = 0x0091
export const PID_OROCHI_V2_RECEIVER = 0x0094
export const PID_OROCHI_V2_BLUETOOTH = 0x0095
export const PID_NAGA_X = 0x0096
export const PID_DEATHADDER_ESSENTIAL2021 = 0x0098
export const PID_BASILISK_V3 = 0x0099
export const PID_PRO_CLICK_MINI_RECEIVER = 0x009a
export const PID_DEATHADDER_V2_XHYPER_SPEED = 0x009c
export const PID_VIPER_MINI_SEWIRED = 0x009e
export const PID_VIPER_MINI_SEWIRELESS = 0x009f
export const PID_DEATHADDER_V2_LITE = 0x00a1
export const PID_COBRA = 0x00a3
export const PID_VIPER_V2_PRO_WIRED = 0x00a5
export const PID_VIPER_V2_PRO_WIRELESS = 0x00a6
export const PID_NAGA_V2_PRO_WIRED = 0x00a7
export const PID_NAGA_V2_PRO_WIRELESS = 0x00a8
export const PID_BASILISK_V3_PRO_WIRED = 0x00aa
export const PID_BASILISK_V3_PRO_WIRELESS = 0x00ab
export const PID_COBRA_PRO_WIRED = 0x00af
export const PID_COBRA_PRO_WIRELESS = 0x00b0
export const PID_DEATHADDER_V3 = 0x00b2
export const PID_HYPER_POLLING_WIRELESS_DONGLE = 0x00b3
export const PID_NAGA_V2_HYPER_SPEED_RECEIVER = 0x00b4
export const PID_DEATHADDER_V3_PRO_WIRED = 0x00b6
export const PID_DEATHADDER_V3_PRO_WIRELESS = 0x00b7
export const PID_VIPER_V3_HYPER_SPEED = 0x00b8
export const PID_BASILISK_V3_XHYPER_SPEED = 0x00b9
export const PID_DEATHADDER_V4_PRO_WIRED = 0x00be
export const PID_DEATHADDER_V4_PRO_WIRELESS = 0x00bf
export const PID_VIPER_V3_PRO_WIRED = 0x00c0
export const PID_VIPER_V3_PRO_WIRELESS = 0x00c1
export const PID_DEATHADDER_V3_PRO_WIRED_ALT = 0x00c2
export const PID_DEATHADDER_V3_PRO_WIRELESS_ALT = 0x00c3
export const PID_DEATHADDER_V3_HYPER_SPEED_WIRED = 0x00c4
export const PID_DEATHADDER_V3_HYPER_SPEED_WIRELESS = 0x00c5
export const PID_PRO_CLICK_V2_VERTICAL_EDITION_WIRED = 0x00c7
export const PID_PRO_CLICK_V2_VERTICAL_EDITION_WIRELESS = 0x00c8
export const PID_BASILISK_V3_35_K = 0x00cb
export const PID_BASILISK_V3_PRO35_KWIRED = 0x00cc
export const PID_BASILISK_V3_PRO35_KWIRELESS = 0x00cd
export const PID_PRO_CLICK_V2_WIRED = 0x00d0
export const PID_PRO_CLICK_V2_WIRELESS = 0x00d1
export const PID_BASILISK_V3_PRO35_KPHANTOM_GREEN_EDITION_WIRED = 0x00d6
export const PID_BASILISK_V3_PRO35_KPHANTOM_GREEN_EDITION_WIRELESS = 0x00d7

class UnsupportedDeviceError extends Error {
  constructor(vid: number, pid: number) {
    super(`Unsupported device VID: ${vid.toString(16)}, PID: ${pid.toString(16)}`)
    this.name = 'UnsupportedDeviceError'
  }
}

export function getDeviceDescriptor(vid: number, pid: number): DeviceProfile {
  switch (vid) {
    case RAZER_VID:
      switch (pid) {
        case PID_OROCHI2011: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling }
            }
          }
        }
        case PID_NAGA: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_NAGA_EPIC: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0xff }, command: chargeLevel },
              chargeStatus: { info: { txId: 0xff }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_ABYSSUS1800: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_MAMBA2012_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0xff }, command: chargeLevel },
              chargeStatus: { info: { txId: 0xff }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion }
            }
          }
        }
        case PID_MAMBA2012_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0xff }, command: chargeLevel },
              chargeStatus: { info: { txId: 0xff }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion }
            }
          }
        }
        case PID_NAGA2012: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_IMPERATOR: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_OUROBOROS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 8200, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0xff }, command: chargeLevel },
              chargeStatus: { info: { txId: 0xff }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_TAIPAN: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 8200, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_NAGA_HEX_RED: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_DEATHADDER2013: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_DEATHADDER1800: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_OROCHI2013: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_NAGA_EPIC_CHROMA_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 8200, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0xff }, command: chargeLevel },
              chargeStatus: { info: { txId: 0xff }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_NAGA_EPIC_CHROMA_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0xff }, command: chargeLevel },
              chargeStatus: { info: { txId: 0xff }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_NAGA2014: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 8200, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_NAGA_HEX: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_ABYSSUS: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_CHROMA: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 10000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_MAMBA_TE: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0xff }, command: dpi },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        // NOTE: PID_OROCHI_WIRED removed: not present in razermouse_driver.c USB device IDs.

        case PID_DIAMONDBACK_CHROMA: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0xff }, command: dpi },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_DEATHADDER2000: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 2000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_NAGA_HEX_V2: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_NAGA_CHROMA: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_DEATHADDER3500: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 3500, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_LANCEHEAD_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x3f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x3f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_LANCEHEAD_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x3f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x3f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_ABYSSUS_V2: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 5000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_ELITE: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_ABYSSUS2000: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 2000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_LANCEHEAD_TE: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_ATHERIS_RECEIVER: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 7200, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 7200, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_BASILISK: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_BASILISK_ESSENTIAL: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0x3f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 6400, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_NAGA_TRINITY: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_ABYSSUS_ELITE_DVA_EDITION: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 7200, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_ABYSSUS_ESSENTIAL: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 7200, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_MAMBA_ELITE: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_ESSENTIAL: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_LANCEHEAD_WIRELESS_RECEIVER: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_LANCEHEAD_WIRELESS_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_ESSENTIAL_WHITE_EDITION: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_MAMBA_WIRELESS_RECEIVER: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x3f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x3f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_MAMBA_WIRELESS_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x3f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x3f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_PRO_CLICK_RECEIVER: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_VIPER: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0xff }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_VIPER_ULTIMATE_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 20000, txId: 0xff }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 20000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0xff }, command: chargeLevel },
              chargeStatus: { info: { txId: 0xff }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_VIPER_ULTIMATE_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0xff }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0xff }, command: chargeLevel },
              chargeStatus: { info: { txId: 0xff }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V2_PRO_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 20000, txId: 0x3f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 20000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x3f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x3f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V2_PRO_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x3f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x3f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_PRO_CLICK_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_BASILISK_XHYPER_SPEED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0xff }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0xff }, command: chargeLevel },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V2: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 20000, txId: 0x3f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_BASILISK_V2: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 20000, txId: 0x1f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_BASILISK_ULTIMATE_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 20000, txId: 0x1f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_BASILISK_ULTIMATE_RECEIVER: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_VIPER_MINI: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 8500, txId: 0xff }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 8500, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V2_MINI: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 8500, txId: 0x3f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 8500, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_NAGA_LEFT_HANDED2020: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 20000, txId: 0x1f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_NAGA_PRO_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 20000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 20000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_NAGA_PRO_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_VIPER8_KHZ: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 20000, txId: 0xff }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 20000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling2: {
                info: { supportedIntervals: [125, 500, 1000, 2000, 4000, 8000], txId: 0x1f },
                command: polling2
              },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_OROCHI_V2_RECEIVER: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 18000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 18000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_OROCHI_V2_BLUETOOTH: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0xff }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_NAGA_X: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 18000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 18000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x08 }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_ESSENTIAL2021: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_BASILISK_V3: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 26000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 26000, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_PRO_CLICK_MINI_RECEIVER: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 12000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 12000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V2_XHYPER_SPEED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 14000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 14000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_VIPER_MINI_SEWIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 30000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 30000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling2: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling2 },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_VIPER_MINI_SEWIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling2: {
                info: { supportedIntervals: [125, 500, 1000, 2000, 4000, 8000], txId: 0x1f },
                command: polling2
              },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V2_LITE: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 8500, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 8500, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_COBRA: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 8500, txId: 0xff }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 8500, maxStages: 5, txId: 0xff }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_VIPER_V2_PRO_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 30000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 30000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_VIPER_V2_PRO_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_NAGA_V2_PRO_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 30000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 30000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_NAGA_V2_PRO_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_BASILISK_V3_PRO_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 30000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 30000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_BASILISK_V3_PRO_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_COBRA_PRO_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 30000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 30000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_COBRA_PRO_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V3: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 30000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 30000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling2: {
                info: { supportedIntervals: [125, 500, 1000, 2000, 4000, 8000], txId: 0x1f },
                command: polling2
              },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_HYPER_POLLING_WIRELESS_DONGLE: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 30000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 30000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling2: {
                info: { supportedIntervals: [125, 500, 1000, 2000, 4000, 8000], txId: 0x1f },
                command: polling2
              },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_NAGA_V2_HYPER_SPEED_RECEIVER: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 30000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 30000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V3_PRO_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 35000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 35000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V3_PRO_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_VIPER_V3_HYPER_SPEED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 30000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 30000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_BASILISK_V3_XHYPER_SPEED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 18000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 18000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V4_PRO_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 45000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 45000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling2: {
                info: { supportedIntervals: [125, 500, 1000, 2000, 4000, 8000], txId: 0x1f },
                command: polling2
              },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial },
              dongleLedMulti: { info: { txId: 0x1f }, command: dongleLedMulti }
            }
          }
        }
        case PID_DEATHADDER_V4_PRO_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling2: {
                info: { supportedIntervals: [125, 250, 500, 1000, 2000, 4000, 8000], txId: 0x1f },
                command: polling2
              },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial },
              dongleLedMulti: { info: { txId: 0x1f }, command: dongleLedMulti }
            }
          }
        }
        case PID_VIPER_V3_PRO_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 35000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 35000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_VIPER_V3_PRO_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling2: {
                info: { supportedIntervals: [125, 500, 1000, 2000, 4000, 8000], txId: 0x1f },
                command: polling2
              },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V3_PRO_WIRED_ALT: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V3_PRO_WIRELESS_ALT: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V3_HYPER_SPEED_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 26000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 26000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_DEATHADDER_V3_HYPER_SPEED_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_PRO_CLICK_V2_VERTICAL_EDITION_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 30000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 30000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 250, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_PRO_CLICK_V2_VERTICAL_EDITION_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_BASILISK_V3_35_K: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 35000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 35000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_BASILISK_V3_PRO35_KWIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 35000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 35000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_BASILISK_V3_PRO35_KWIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_PRO_CLICK_V2_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 30000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 30000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 250, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_PRO_CLICK_V2_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_BASILISK_V3_PRO35_KPHANTOM_GREEN_EDITION_WIRED: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 35000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 35000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_BASILISK_V3_PRO35_KPHANTOM_GREEN_EDITION_WIRELESS: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
      }
  }

  throw new UnsupportedDeviceError(vid, pid)
}
