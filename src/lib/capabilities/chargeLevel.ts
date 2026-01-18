import { sendReport } from '../device/hid'
import type { DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'

export type ChargeLevelData = {
  percentage: number
}

export type ChargeLevelInfo = never

export const getChargeLevel = async (device: DeviceWithCapabilities<'chargeLevel'>): Promise<ChargeLevelData> => {
  const report = RazerReport.from(0x07, 0x80, 0x02, new Uint8Array(0))
  const responseResult = await sendReport(device, report)
  return { percentage: (responseResult.args[1] / 0xff) * 100 }
}
