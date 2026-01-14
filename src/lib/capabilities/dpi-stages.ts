import { sendCommand } from '../device/hid'
import type { Device } from '../device/device'
import { RazerReport } from '../device/report'
import { PID_DEATHADDER_V4_PRO_WIRED, PID_DEATHADDER_V4_PRO_WIRELESS } from '../device/devices'

export type DpiStagesData = {
  dpiLevels: [number, number][]
  activeStage: number
}

export type DpiStagesLimits = {
  minDpi: number
  maxDpi: number
  maxStages: number
}
/**
 * Response format (hex):
 * 01    varstore
 * 02    active DPI stage
 * 04    number of stages = 4
 *
 * 01    first DPI stage
 * 03 20 first stage DPI X = 800
 * 03 20 first stage DPI Y = 800
 * 00 00 reserved
 *
 * 02    second DPI stage
 * 07 08 second stage DPI X = 1800
 * 07 08 second stage DPI Y = 1800
 * 00 00 reserved
 */
export const getDpiStages = async (device: Device): Promise<DpiStagesData> => {
  switch (device.hid.productId) {
    case PID_DEATHADDER_V4_PRO_WIRED:
    case PID_DEATHADDER_V4_PRO_WIRELESS: {
      const report = RazerReport.from(0x04, 0x86, new Uint8Array([0x01]))
      report.dataSize = 0x26
      const response = await sendCommand(device, report)

      const args = response.args
      const dataSize = Math.min(response.dataSize)

      const activeStage = args[1]
      const stagesCount = args[2]
      const dpiLevels: [number, number][] = []

      let argsOffset = 4
      for (let i = 0; i < stagesCount; i++) {
        if (argsOffset + 4 > dataSize) break
        const dpiX = (args[argsOffset] << 8) | args[argsOffset + 1]
        const dpiY = (args[argsOffset + 2] << 8) | args[argsOffset + 3]
        dpiLevels.push([dpiX, dpiY])
        argsOffset += 7
      }

      return { dpiLevels, activeStage }
    }

    default:
      throw new Error(`No DPI Stages implementation for device PID: 0x${device.hid.productId.toString(16)}`)
  }
}
