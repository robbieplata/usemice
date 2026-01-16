import { sendReport } from '../device/hid'
import type { DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'
import { PID_DEATHADDER_V4_PRO_WIRED, PID_DEATHADDER_V4_PRO_WIRELESS } from '../device/devices'

export type ChargeLevelData = {
  percentage: number
}

export type ChargeLevelLimits = never

export const getChargeLevel = async (device: DeviceWithCapabilities<'chargeLevel'>): Promise<ChargeLevelData> => {
  switch (device.hid.productId) {
    case PID_DEATHADDER_V4_PRO_WIRED:
    case PID_DEATHADDER_V4_PRO_WIRELESS: {
      const report = RazerReport.from(0x07, 0x80, 0x02, new Uint8Array(0))
      const responseResult = await sendReport(device, report)
      return { percentage: (responseResult.args[1] / 0xff) * 100 }
    }

    default:
      throw new Error(`No ChargeLevel implementation for device PID: 0x${device.hid.productId.toString(16)}`)
  }
}
