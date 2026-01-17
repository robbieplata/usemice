import { sendReport } from '../device/hid'
import type { DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'
import {
  PID_DEATHADDER_V3_PRO_WIRED_ALT,
  PID_DEATHADDER_V3_PRO_WIRELESS_ALT,
  PID_DEATHADDER_V4_PRO_WIRED,
  PID_DEATHADDER_V4_PRO_WIRELESS
} from '../device/devices'

export type ChargeStatusData = {
  status: boolean
}

export type ChargeStatusLimits = never

export const getChargeStatus = async (device: DeviceWithCapabilities<'chargeStatus'>): Promise<ChargeStatusData> => {
  switch (device.hid.productId) {
    case PID_DEATHADDER_V4_PRO_WIRED:
    case PID_DEATHADDER_V4_PRO_WIRELESS:
    case PID_DEATHADDER_V3_PRO_WIRED_ALT:
    case PID_DEATHADDER_V3_PRO_WIRELESS_ALT: {
      const report = RazerReport.from(0x07, 0x84, 0x02, new Uint8Array(0))
      const response = await sendReport(device, report)
      return { status: Boolean(response.args[1]) }
    }

    default:
      throw new Error(`No ChargeStatus implementation for device PID: 0x${device.hid.productId.toString(16)}`)
  }
}
