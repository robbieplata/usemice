import { sendCommand } from '../device/hid'
import type { Device } from '../device/device'
import { RazerReport } from '../device/report'
import { PID_DEATHADDER_V4_PRO_WIRED, PID_DEATHADDER_V4_PRO_WIRELESS } from '../device/devices'

export type ChargeStatusData = {
  status: boolean
}

export type ChargeStatusLimits = never

export const getChargeStatus = async (device: Device): Promise<ChargeStatusData> => {
  switch (device.hid.productId) {
    case PID_DEATHADDER_V4_PRO_WIRED:
    case PID_DEATHADDER_V4_PRO_WIRELESS: {
      const report = RazerReport.from(0x07, 0x84, 0x02, new Uint8Array(0))
      const response = await sendCommand(device, report)
      return { status: Boolean(response.args[1]) }
    }

    default:
      throw new Error(`No ChargeStatus implementation for device PID: 0x${device.hid.productId.toString(16)}`)
  }
}
