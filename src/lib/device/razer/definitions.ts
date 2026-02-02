import { chargeLevel } from '@/lib/capabilities/chargeLevel'
import { chargeStatus } from '@/lib/capabilities/chargeStatus'
import { dongleLed } from '@/lib/capabilities/dongleLed'
import { dongleLedMulti } from '@/lib/capabilities/dongleLedMulti'
import { dpi } from '@/lib/capabilities/dpi'
import { dpiStages } from '@/lib/capabilities/dpiStages'
import { firmwareVersion } from '@/lib/capabilities/firmwareVersion'
import { idleTime } from '@/lib/capabilities/idleTime'
import { polling } from '@/lib/capabilities/polling'

import { serial } from '@/lib/capabilities/serial'
import { PID_RAZER } from '../constants'
import { UnsupportedDeviceError, type DeviceDefinition } from '../definitions'

export function getRazerDefinition(hid: HIDDevice): DeviceDefinition {
  switch (hid.productId) {
    case PID_RAZER.OROCHI2011:
      return {
        polling: polling.razer('legacy', [125, 500, 1000], 0xff)
      }
    case PID_RAZER.NAGA:
      return {
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.NAGA_EPIC:
      return {
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0xff),
        chargeStatus: chargeStatus.razer(0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.ABYSSUS1800:
      return {
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.MAMBA2012_WIRED:
      return {
        dpi: dpi.razer(100, 6400, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0xff),
        chargeStatus: chargeStatus.razer(0xff),
        firmwareVersion: firmwareVersion.razer(0xff)
      }
    case PID_RAZER.MAMBA2012_WIRELESS:
      return {
        dpi: dpi.razer(100, 6400, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0xff),
        chargeStatus: chargeStatus.razer(0xff),
        firmwareVersion: firmwareVersion.razer(0xff)
      }
    case PID_RAZER.NAGA2012:
      return {
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.IMPERATOR:
      return {
        dpi: dpi.razer(100, 6400, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.OUROBOROS:
      return {
        dpi: dpi.razer(100, 8200, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0xff),
        chargeStatus: chargeStatus.razer(0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.TAIPAN:
      return {
        dpi: dpi.razer(100, 8200, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.NAGA_HEX_RED:
      return {
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.DEATHADDER2013:
      return {
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.DEATHADDER1800:
      return {
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.OROCHI2013:
      return {
        dpi: dpi.razer(100, 6400, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.NAGA_EPIC_CHROMA_WIRED:
      return {
        dpi: dpi.razer(100, 8200, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0xff),
        chargeStatus: chargeStatus.razer(0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.NAGA_EPIC_CHROMA_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0xff),
        chargeStatus: chargeStatus.razer(0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.NAGA2014:
      return {
        dpi: dpi.razer(100, 8200, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.NAGA_HEX:
      return {
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.ABYSSUS:
      return {
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.DEATHADDER_CHROMA:
      return {
        dpi: dpi.razer(100, 10000, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.MAMBA_TE:
      return {
        dpi: dpi.razer(100, 16000, 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.DIAMONDBACK_CHROMA:
      return {
        dpi: dpi.razer(100, 16000, 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.DEATHADDER2000:
      return {
        dpi: dpi.razer(100, 2000, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.NAGA_HEX_V2:
      return {
        dpi: dpi.razer(100, 16000, 0x3f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.NAGA_CHROMA:
      return {
        dpi: dpi.razer(100, 16000, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.DEATHADDER3500:
      return {
        dpi: dpi.razer(100, 3500, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.LANCEHEAD_WIRED:
      return {
        dpi: dpi.razer(100, 16000, 0x3f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x3f),
        chargeStatus: chargeStatus.razer(0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.LANCEHEAD_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x3f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x3f),
        chargeStatus: chargeStatus.razer(0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.ABYSSUS_V2:
      return {
        dpi: dpi.razer(100, 5000, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.DEATHADDER_ELITE:
      return {
        dpi: dpi.razer(100, 16000, 0x3f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.ABYSSUS2000:
      return {
        dpi: dpi.razer(100, 2000, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.LANCEHEAD_TE:
      return {
        dpi: dpi.razer(100, 16000, 0x3f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.ATHERIS_RECEIVER:
      return {
        dpi: dpi.razer(100, 7200, 0x1f),
        dpiStages: dpiStages.razer(100, 7200, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.BASILISK:
      return {
        dpi: dpi.razer(100, 16000, 0x3f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.BASILISK_ESSENTIAL:
      return {
        dpi: dpi.razer(100, 6400, 0x3f),
        dpiStages: dpiStages.razer(100, 6400, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.NAGA_TRINITY:
      return {
        dpi: dpi.razer(100, 16000, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.ABYSSUS_ELITE_DVA_EDITION:
      return {
        dpi: dpi.razer(100, 7200, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.ABYSSUS_ESSENTIAL:
      return {
        dpi: dpi.razer(100, 7200, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.MAMBA_ELITE:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.DEATHADDER_ESSENTIAL:
      return {
        dpi: dpi.razer(100, 6400, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.LANCEHEAD_WIRELESS_RECEIVER:
      return {
        dpi: dpi.razer(100, 16000, 0x3f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.LANCEHEAD_WIRELESS_WIRED:
      return {
        dpi: dpi.razer(100, 16000, 0x3f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.DEATHADDER_ESSENTIAL_WHITE_EDITION:
      return {
        dpi: dpi.razer(100, 6400, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.MAMBA_WIRELESS_RECEIVER:
      return {
        dpi: dpi.razer(100, 16000, 0x3f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x3f),
        chargeStatus: chargeStatus.razer(0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.MAMBA_WIRELESS_WIRED:
      return {
        dpi: dpi.razer(100, 16000, 0x3f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x3f),
        chargeStatus: chargeStatus.razer(0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.PRO_CLICK_RECEIVER:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.VIPER:
      return {
        dpi: dpi.razer(100, 16000, 0xff),
        dpiStages: dpiStages.razer(100, 16000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.VIPER_ULTIMATE_WIRED:
      return {
        dpi: dpi.razer(100, 20000, 0xff),
        dpiStages: dpiStages.razer(100, 20000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0xff),
        chargeStatus: chargeStatus.razer(0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.VIPER_ULTIMATE_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0xff),
        dpiStages: dpiStages.razer(100, 16000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0xff),
        chargeStatus: chargeStatus.razer(0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.DEATHADDER_V2_PRO_WIRED:
      return {
        dpi: dpi.razer(100, 20000, 0x3f),
        dpiStages: dpiStages.razer(100, 20000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x3f),
        chargeStatus: chargeStatus.razer(0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.DEATHADDER_V2_PRO_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x3f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x3f),
        chargeStatus: chargeStatus.razer(0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.PRO_CLICK_WIRED:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.BASILISK_XHYPER_SPEED:
      return {
        dpi: dpi.razer(100, 16000, 0xff),
        dpiStages: dpiStages.razer(100, 16000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.DEATHADDER_V2:
      return {
        dpi: dpi.razer(100, 20000, 0x3f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.BASILISK_V2:
      return {
        dpi: dpi.razer(100, 20000, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.BASILISK_ULTIMATE_WIRED:
      return {
        dpi: dpi.razer(100, 20000, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.BASILISK_ULTIMATE_RECEIVER:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.VIPER_MINI:
      return {
        dpi: dpi.razer(100, 8500, 0xff),
        dpiStages: dpiStages.razer(100, 8500, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.DEATHADDER_V2_MINI:
      return {
        dpi: dpi.razer(100, 8500, 0x3f),
        dpiStages: dpiStages.razer(100, 8500, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x3f),
        firmwareVersion: firmwareVersion.razer(0x3f),
        serial: serial.razer(0x3f)
      }
    case PID_RAZER.NAGA_LEFT_HANDED2020:
      return {
        dpi: dpi.razer(100, 20000, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.NAGA_PRO_WIRED:
      return {
        dpi: dpi.razer(100, 20000, 0x1f),
        dpiStages: dpiStages.razer(100, 20000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.NAGA_PRO_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.VIPER8_KHZ:
      return {
        dpi: dpi.razer(100, 20000, 0xff),
        dpiStages: dpiStages.razer(100, 20000, 5, 0xff),
        polling: polling.razer('v2', [125, 500, 1000, 2000, 4000, 8000], 0x1f),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.OROCHI_V2_RECEIVER:
      return {
        dpi: dpi.razer(100, 18000, 0x1f),
        dpiStages: dpiStages.razer(100, 18000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.OROCHI_V2_BLUETOOTH:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0xff),
        chargeLevel: chargeLevel.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.NAGA_X:
      return {
        dpi: dpi.razer(100, 18000, 0x1f),
        dpiStages: dpiStages.razer(100, 18000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x08)
      }
    case PID_RAZER.DEATHADDER_ESSENTIAL2021:
      return {
        dpi: dpi.razer(100, 6400, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.BASILISK_V3:
      return {
        dpi: dpi.razer(100, 26000, 0x1f),
        dpiStages: dpiStages.razer(100, 26000, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.PRO_CLICK_MINI_RECEIVER:
      return {
        dpi: dpi.razer(100, 12000, 0x1f),
        dpiStages: dpiStages.razer(100, 12000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.DEATHADDER_V2_XHYPER_SPEED:
      return {
        dpi: dpi.razer(100, 14000, 0x1f),
        dpiStages: dpiStages.razer(100, 14000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.VIPER_MINI_SEWIRED:
      return {
        dpi: dpi.razer(100, 30000, 0x1f),
        dpiStages: dpiStages.razer(100, 30000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.VIPER_MINI_SEWIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('v2', [125, 500, 1000, 2000, 4000, 8000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f),
        dongleLed: dongleLed.razer(0x1f)
      }
    case PID_RAZER.DEATHADDER_V2_LITE:
      return {
        dpi: dpi.razer(100, 8500, 0x1f),
        dpiStages: dpiStages.razer(100, 8500, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.COBRA:
      return {
        dpi: dpi.razer(100, 8500, 0xff),
        dpiStages: dpiStages.razer(100, 8500, 5, 0xff),
        polling: polling.razer('legacy', [125, 500, 1000], 0xff),
        firmwareVersion: firmwareVersion.razer(0xff),
        serial: serial.razer(0xff)
      }
    case PID_RAZER.VIPER_V2_PRO_WIRED:
      return {
        dpi: dpi.razer(100, 30000, 0x1f),
        dpiStages: dpiStages.razer(100, 30000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.VIPER_V2_PRO_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.NAGA_V2_PRO_WIRED:
      return {
        dpi: dpi.razer(100, 30000, 0x1f),
        dpiStages: dpiStages.razer(100, 30000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.NAGA_V2_PRO_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.BASILISK_V3_PRO_WIRED:
      return {
        dpi: dpi.razer(100, 30000, 0x1f),
        dpiStages: dpiStages.razer(100, 30000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.BASILISK_V3_PRO_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.COBRA_PRO_WIRED:
      return {
        dpi: dpi.razer(100, 30000, 0x1f),
        dpiStages: dpiStages.razer(100, 30000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.COBRA_PRO_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.DEATHADDER_V3:
      return {
        dpi: dpi.razer(100, 30000, 0x1f),
        dpiStages: dpiStages.razer(100, 30000, 5, 0x1f),
        polling: polling.razer('v2', [125, 500, 1000, 2000, 4000, 8000], 0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.HYPER_POLLING_WIRELESS_DONGLE:
      return {
        dpi: dpi.razer(100, 30000, 0x1f),
        dpiStages: dpiStages.razer(100, 30000, 5, 0x1f),
        polling: polling.razer('v2', [125, 500, 1000, 2000, 4000, 8000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.NAGA_V2_HYPER_SPEED_RECEIVER:
      return {
        dpi: dpi.razer(100, 30000, 0x1f),
        dpiStages: dpiStages.razer(100, 30000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.DEATHADDER_V3_PRO_WIRED:
      return {
        dpi: dpi.razer(100, 35000, 0x1f),
        dpiStages: dpiStages.razer(100, 35000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.DEATHADDER_V3_PRO_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.VIPER_V3_HYPER_SPEED:
      return {
        dpi: dpi.razer(100, 30000, 0x1f),
        dpiStages: dpiStages.razer(100, 30000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.BASILISK_V3_XHYPER_SPEED:
      return {
        dpi: dpi.razer(100, 18000, 0x1f),
        dpiStages: dpiStages.razer(100, 18000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.DEATHADDER_V4_PRO_WIRED:
      return {
        dpi: dpi.razer(100, 45000, 0x1f),
        dpiStages: dpiStages.razer(100, 45000, 5, 0x1f),
        polling: polling.razer('v2', [125, 500, 1000, 2000, 4000, 8000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.DEATHADDER_V4_PRO_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('v2', [125, 250, 500, 1000, 2000, 4000, 8000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f),
        dongleLedMulti: dongleLedMulti.razer(0x1f)
      }
    case PID_RAZER.VIPER_V3_PRO_WIRED:
      return {
        dpi: dpi.razer(100, 35000, 0x1f),
        dpiStages: dpiStages.razer(100, 35000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.VIPER_V3_PRO_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('v2', [125, 500, 1000, 2000, 4000, 8000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f),
        dongleLed: dongleLed.razer(0xff)
      }
    case PID_RAZER.DEATHADDER_V3_PRO_WIRED_ALT:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.DEATHADDER_V3_PRO_WIRELESS_ALT:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f),
        dongleLed: dongleLed.razer(0x1f)
      }
    case PID_RAZER.DEATHADDER_V3_HYPER_SPEED_WIRED:
      return {
        dpi: dpi.razer(100, 26000, 0x1f),
        dpiStages: dpiStages.razer(100, 26000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.DEATHADDER_V3_HYPER_SPEED_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.PRO_CLICK_V2_VERTICAL_EDITION_WIRED:
      return {
        dpi: dpi.razer(100, 30000, 0x1f),
        dpiStages: dpiStages.razer(100, 30000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 250, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.PRO_CLICK_V2_VERTICAL_EDITION_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.BASILISK_V3_35_K:
      return {
        dpi: dpi.razer(100, 35000, 0x1f),
        dpiStages: dpiStages.razer(100, 35000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.BASILISK_V3_PRO35_KWIRED:
      return {
        dpi: dpi.razer(100, 35000, 0x1f),
        dpiStages: dpiStages.razer(100, 35000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.BASILISK_V3_PRO35_KWIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.PRO_CLICK_V2_WIRED:
      return {
        dpi: dpi.razer(100, 30000, 0x1f),
        dpiStages: dpiStages.razer(100, 30000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 250, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.PRO_CLICK_V2_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.BASILISK_V3_PRO35_KPHANTOM_GREEN_EDITION_WIRED:
      return {
        dpi: dpi.razer(100, 35000, 0x1f),
        dpiStages: dpiStages.razer(100, 35000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
    case PID_RAZER.BASILISK_V3_PRO35_KPHANTOM_GREEN_EDITION_WIRELESS:
      return {
        dpi: dpi.razer(100, 16000, 0x1f),
        dpiStages: dpiStages.razer(100, 16000, 5, 0x1f),
        polling: polling.razer('legacy', [125, 500, 1000], 0x1f),
        idleTime: idleTime.razer(60, 900, 0x1f),
        chargeLevel: chargeLevel.razer(0x1f),
        chargeStatus: chargeStatus.razer(0x1f),
        firmwareVersion: firmwareVersion.razer(0x1f),
        serial: serial.razer(0x1f)
      }
  }
  throw new UnsupportedDeviceError(hid)
}
