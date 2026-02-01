import { chargeLevel } from '../capabilities/razer/chargeLevel'
import { chargeStatus } from '../capabilities/razer/chargeStatus'
import { dongleLed } from '../capabilities/razer/dongleLed'
import { dongleLedMulti } from '../capabilities/razer/dongleLedMulti'
import { dpi } from '../capabilities/razer/dpi'
import { dpiStages } from '../capabilities/razer/dpiStages'
import { firmwareVersion } from '../capabilities/razer/firmwareVersion'
import { idleTime } from '../capabilities/razer/idleTime'
import { polling } from '../capabilities/razer/polling'
import { polling2 } from '../capabilities/razer/polling2'
import { serial } from '../capabilities/razer/serial'
import { type CapabilityEntry, type CapabilityKey } from './device'
import { PID_RAZER, VID_RAZER } from './constants'

export type DeviceProfile = {
  capabilities: Partial<{ [K in CapabilityKey]: CapabilityEntry<K> }>
}

class UnsupportedDeviceError extends Error {
  constructor(vid: number, pid: number) {
    super(`Unsupported device VID: ${vid.toString(16)}, PID: ${pid.toString(16)}`)
    this.name = 'UnsupportedDeviceError'
  }
}

export function getDeviceDefinition(vid: number, pid: number): DeviceProfile {
  switch (vid) {
    case VID_RAZER:
      switch (pid) {
        case PID_RAZER.OROCHI2011: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling }
            }
          }
        }
        case PID_RAZER.NAGA: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.NAGA_EPIC: {
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
        case PID_RAZER.ABYSSUS1800: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.MAMBA2012_WIRED: {
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
        case PID_RAZER.MAMBA2012_WIRELESS: {
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
        case PID_RAZER.NAGA2012: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.IMPERATOR: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.OUROBOROS: {
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
        case PID_RAZER.TAIPAN: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 8200, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.NAGA_HEX_RED: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.DEATHADDER2013: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.DEATHADDER1800: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.OROCHI2013: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.NAGA_EPIC_CHROMA_WIRED: {
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
        case PID_RAZER.NAGA_EPIC_CHROMA_WIRELESS: {
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
        case PID_RAZER.NAGA2014: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 8200, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.NAGA_HEX: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.ABYSSUS: {
          return {
            capabilities: {
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.DEATHADDER_CHROMA: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 10000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.MAMBA_TE: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0xff }, command: dpi },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        // NOTE: ID.PID_OROCHI_WIRED removed: not present in razermouse_driver.c USB device IDs.

        case PID_RAZER.DIAMONDBACK_CHROMA: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0xff }, command: dpi },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.DEATHADDER2000: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 2000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.NAGA_HEX_V2: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_RAZER.NAGA_CHROMA: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.DEATHADDER3500: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 3500, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.LANCEHEAD_WIRED: {
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
        case PID_RAZER.LANCEHEAD_WIRELESS: {
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
        case PID_RAZER.ABYSSUS_V2: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 5000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.DEATHADDER_ELITE: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_RAZER.ABYSSUS2000: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 2000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.LANCEHEAD_TE: {
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
        case PID_RAZER.ATHERIS_RECEIVER: {
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
        case PID_RAZER.BASILISK: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x3f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_RAZER.BASILISK_ESSENTIAL: {
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
        case PID_RAZER.NAGA_TRINITY: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.ABYSSUS_ELITE_DVA_EDITION: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 7200, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.ABYSSUS_ESSENTIAL: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 7200, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.MAMBA_ELITE: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.DEATHADDER_ESSENTIAL: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.LANCEHEAD_WIRELESS_RECEIVER: {
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
        case PID_RAZER.LANCEHEAD_WIRELESS_WIRED: {
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
        case PID_RAZER.DEATHADDER_ESSENTIAL_WHITE_EDITION: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.MAMBA_WIRELESS_RECEIVER: {
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
        case PID_RAZER.MAMBA_WIRELESS_WIRED: {
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
        case PID_RAZER.PRO_CLICK_RECEIVER: {
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
        case PID_RAZER.VIPER: {
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
        case PID_RAZER.VIPER_ULTIMATE_WIRED: {
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
        case PID_RAZER.VIPER_ULTIMATE_WIRELESS: {
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
        case PID_RAZER.DEATHADDER_V2_PRO_WIRED: {
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
        case PID_RAZER.DEATHADDER_V2_PRO_WIRELESS: {
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
        case PID_RAZER.PRO_CLICK_WIRED: {
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
        case PID_RAZER.BASILISK_XHYPER_SPEED: {
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
        case PID_RAZER.DEATHADDER_V2: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 20000, txId: 0x3f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x3f }, command: polling },
              firmwareVersion: { info: { txId: 0x3f }, command: firmwareVersion },
              serial: { info: { txId: 0x3f }, command: serial }
            }
          }
        }
        case PID_RAZER.BASILISK_V2: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 20000, txId: 0x1f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_RAZER.BASILISK_ULTIMATE_WIRED: {
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
        case PID_RAZER.BASILISK_ULTIMATE_RECEIVER: {
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
        case PID_RAZER.VIPER_MINI: {
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
        case PID_RAZER.DEATHADDER_V2_MINI: {
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
        case PID_RAZER.NAGA_LEFT_HANDED2020: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 20000, txId: 0x1f }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_RAZER.NAGA_PRO_WIRED: {
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
        case PID_RAZER.NAGA_PRO_WIRELESS: {
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
        case PID_RAZER.VIPER8_KHZ: {
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
        case PID_RAZER.OROCHI_V2_RECEIVER: {
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
        case PID_RAZER.OROCHI_V2_BLUETOOTH: {
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
        case PID_RAZER.NAGA_X: {
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
        case PID_RAZER.DEATHADDER_ESSENTIAL2021: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 6400, txId: 0xff }, command: dpi },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0xff }, command: polling },
              firmwareVersion: { info: { txId: 0xff }, command: firmwareVersion },
              serial: { info: { txId: 0xff }, command: serial }
            }
          }
        }
        case PID_RAZER.BASILISK_V3: {
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
        case PID_RAZER.PRO_CLICK_MINI_RECEIVER: {
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
        case PID_RAZER.DEATHADDER_V2_XHYPER_SPEED: {
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
        case PID_RAZER.VIPER_MINI_SEWIRED: {
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
        case PID_RAZER.VIPER_MINI_SEWIRELESS: {
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
              serial: { info: { txId: 0x1f }, command: serial },
              dongleLed: { info: { txId: 0x1f }, command: dongleLed }
            }
          }
        }
        case PID_RAZER.DEATHADDER_V2_LITE: {
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
        case PID_RAZER.COBRA: {
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
        case PID_RAZER.VIPER_V2_PRO_WIRED: {
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
        case PID_RAZER.VIPER_V2_PRO_WIRELESS: {
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
        case PID_RAZER.NAGA_V2_PRO_WIRED: {
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
        case PID_RAZER.NAGA_V2_PRO_WIRELESS: {
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
        case PID_RAZER.BASILISK_V3_PRO_WIRED: {
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
        case PID_RAZER.BASILISK_V3_PRO_WIRELESS: {
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
        case PID_RAZER.COBRA_PRO_WIRED: {
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
        case PID_RAZER.COBRA_PRO_WIRELESS: {
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
        case PID_RAZER.DEATHADDER_V3: {
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
        case PID_RAZER.HYPER_POLLING_WIRELESS_DONGLE: {
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
        case PID_RAZER.NAGA_V2_HYPER_SPEED_RECEIVER: {
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
        case PID_RAZER.DEATHADDER_V3_PRO_WIRED: {
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
        case PID_RAZER.DEATHADDER_V3_PRO_WIRELESS: {
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
        case PID_RAZER.VIPER_V3_HYPER_SPEED: {
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
        case PID_RAZER.BASILISK_V3_XHYPER_SPEED: {
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
        case PID_RAZER.DEATHADDER_V4_PRO_WIRED: {
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
              serial: { info: { txId: 0x1f }, command: serial }
            }
          }
        }
        case PID_RAZER.DEATHADDER_V4_PRO_WIRELESS: {
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
        case PID_RAZER.VIPER_V3_PRO_WIRED: {
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
        case PID_RAZER.VIPER_V3_PRO_WIRELESS: {
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
              serial: { info: { txId: 0x1f }, command: serial },
              dongleLed: { info: { txId: 0xff }, command: dongleLed }
            }
          }
        }
        case PID_RAZER.DEATHADDER_V3_PRO_WIRED_ALT: {
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
        case PID_RAZER.DEATHADDER_V3_PRO_WIRELESS_ALT: {
          return {
            capabilities: {
              dpi: { info: { minDpi: 100, maxDpi: 16000, txId: 0x1f }, command: dpi },
              dpiStages: { info: { minDpi: 100, maxDpi: 16000, maxStages: 5, txId: 0x1f }, command: dpiStages },
              polling: { info: { supportedIntervals: [125, 500, 1000], txId: 0x1f }, command: polling },
              idleTime: { info: { minSeconds: 60, maxSeconds: 900, txId: 0x1f }, command: idleTime },
              chargeLevel: { info: { txId: 0x1f }, command: chargeLevel },
              chargeStatus: { info: { txId: 0x1f }, command: chargeStatus },
              firmwareVersion: { info: { txId: 0x1f }, command: firmwareVersion },
              serial: { info: { txId: 0x1f }, command: serial },
              dongleLed: { info: { txId: 0x1f }, command: dongleLed }
            }
          }
        }
        case PID_RAZER.DEATHADDER_V3_HYPER_SPEED_WIRED: {
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
        case PID_RAZER.DEATHADDER_V3_HYPER_SPEED_WIRELESS: {
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
        case PID_RAZER.PRO_CLICK_V2_VERTICAL_EDITION_WIRED: {
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
        case PID_RAZER.PRO_CLICK_V2_VERTICAL_EDITION_WIRELESS: {
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
        case PID_RAZER.BASILISK_V3_35_K: {
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
        case PID_RAZER.BASILISK_V3_PRO35_KWIRED: {
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
        case PID_RAZER.BASILISK_V3_PRO35_KWIRELESS: {
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
        case PID_RAZER.PRO_CLICK_V2_WIRED: {
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
        case PID_RAZER.PRO_CLICK_V2_WIRELESS: {
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
        case PID_RAZER.BASILISK_V3_PRO35_KPHANTOM_GREEN_EDITION_WIRED: {
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
        case PID_RAZER.BASILISK_V3_PRO35_KPHANTOM_GREEN_EDITION_WIRELESS: {
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
