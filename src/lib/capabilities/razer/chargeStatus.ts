import type { CapabilityCommand, DeviceWithCapabilities } from '../../device/device'
import { RazerReport } from '../../device/razerReport'

export type ChargeStatusData = {
  status: boolean
}

export type ChargeStatusInfo = object

export const getChargeStatus = async (device: DeviceWithCapabilities<'chargeStatus'>): Promise<ChargeStatusData> => {
  const report = RazerReport.from({ commandClass: 0x07, commandId: 0x84, dataSize: 0x02, args: new Uint8Array(0) })
  const response = await report.sendReport(device)
  return { status: Boolean(response.args[1]) }
}

export const chargeStatus: CapabilityCommand<'chargeStatus', ChargeStatusData> = {
  get: getChargeStatus
}
