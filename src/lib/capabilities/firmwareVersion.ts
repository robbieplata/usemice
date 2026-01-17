import { sendReport } from '../device/hid'
import type { DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'
import {
  PID_DEATHADDER_V3_PRO_WIRED_ALT,
  PID_DEATHADDER_V3_PRO_WIRELESS_ALT,
  PID_DEATHADDER_V4_PRO_WIRED,
  PID_DEATHADDER_V4_PRO_WIRELESS
} from '../device/devices'

export type FirmwareVersionData = {
  major: number
  minor: number
}

export type FirmwareVersionLimits = never

export const getFirmwareVersion = async (
  device: DeviceWithCapabilities<'firmwareVersion'>
): Promise<FirmwareVersionData> => {
  switch (device.hid.productId) {
    case PID_DEATHADDER_V4_PRO_WIRED:
    case PID_DEATHADDER_V4_PRO_WIRELESS:
    case PID_DEATHADDER_V3_PRO_WIRED_ALT:
    case PID_DEATHADDER_V3_PRO_WIRELESS_ALT: {
      const report = RazerReport.from(0x00, 0x81, 0x02, new Uint8Array(0))
      report.transactionId = 0x1f
      const response = await sendReport(device, report)
      return { major: response.args[0], minor: response.args[1] }
    }

    default:
      throw new Error(`No FirmwareVersion implementation for device PID: 0x${device.hid.productId.toString(16)}`)
  }
}
