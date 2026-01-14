import { sendCommand } from '../device/hid'
import type { Device } from '../device/device'
import { RazerReport } from '../device/report'
import { PID_DEATHADDER_V4_PRO_WIRED, PID_DEATHADDER_V4_PRO_WIRELESS } from '../device/devices'

export type SerialData = string
export type SerialLimits = never

export const getSerial = async (device: Device): Promise<string> => {
  switch (device.hid.productId) {
    case PID_DEATHADDER_V4_PRO_WIRED:
    case PID_DEATHADDER_V4_PRO_WIRELESS: {
      const report = RazerReport.from(0x00, 0x82, 0x16, new Uint8Array([0]))
      report.dataSize = 0x16
      const response = await sendCommand(device, report)
      const bytes = response.args.slice(0, 22)
      const nullIdx = bytes.indexOf(0x00)
      const serialBytes = nullIdx === -1 ? bytes : bytes.slice(0, nullIdx)
      return new TextDecoder('utf-8').decode(serialBytes)
    }

    default:
      throw new Error(`No Serial implementation for device PID: 0x${device.hid.productId.toString(16)}`)
  }
}
