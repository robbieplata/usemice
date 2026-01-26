import { sendReport } from '../device/hid'
import type { CapabilityCommand, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'

export type ChargeLevelData = {
  percentage: number
}

export type ChargeLevelInfo = object

export const getChargeLevel = async (device: DeviceWithCapabilities<'chargeLevel'>): Promise<ChargeLevelData> => {
  const report = RazerReport.from({ commandClass: 0x07, commandId: 0x80, dataSize: 0x02, args: new Uint8Array(0) })
  const responseResult = await sendReport(device, report)
  return { percentage: (responseResult.args[1] / 0xff) * 100 }
}

export const chargeLevel: CapabilityCommand<'chargeLevel', ChargeLevelData> = {
  get: getChargeLevel
}
