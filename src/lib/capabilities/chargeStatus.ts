import { sendReport } from '../device/hid'
import type { DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'

export type ChargeStatusData = {
  status: boolean
}

export type ChargeStatusLimits = never

export const getChargeStatus = async (device: DeviceWithCapabilities<'chargeStatus'>): Promise<ChargeStatusData> => {
  const report = RazerReport.from(0x07, 0x84, 0x02, new Uint8Array(0))
  const response = await sendReport(device, report)
  return { status: Boolean(response.args[1]) }
}
