import { sendReport } from '../device/hid'
import type { DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'
import {
  PID_DEATHADDER_V3_PRO_WIRED_ALT,
  PID_DEATHADDER_V3_PRO_WIRELESS_ALT,
  PID_DEATHADDER_V4_PRO_WIRED,
  PID_DEATHADDER_V4_PRO_WIRELESS
} from '../device/devices'

export type SerialData = {
  serialNumber: string
}
export type SerialLimits = never

export const getSerial = async (device: DeviceWithCapabilities<'serial'>): Promise<SerialData> => {
  switch (device.hid.productId) {
    case PID_DEATHADDER_V4_PRO_WIRED:
    case PID_DEATHADDER_V4_PRO_WIRELESS:
    case PID_DEATHADDER_V3_PRO_WIRED_ALT:
    case PID_DEATHADDER_V3_PRO_WIRELESS_ALT: {
      const report = RazerReport.from(0x00, 0x82, 0x16, new Uint8Array([0]))
      report.dataSize = 0x16
      const response = await sendReport(device, report)
      const bytes = response.args.slice(0, 22)
      const nullIdx = bytes.indexOf(0x00)
      const serialBytes = nullIdx === -1 ? bytes : bytes.slice(0, nullIdx)
      return { serialNumber: new TextDecoder('utf-8').decode(serialBytes) }
    }

    default:
      throw new Error(`No Serial implementation for device PID: 0x${device.hid.productId.toString(16)}`)
  }
}
