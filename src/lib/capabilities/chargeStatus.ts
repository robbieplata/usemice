import { sendReport } from '../device/hid'
import type { DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'

export type ChargeStatusData = {
  status: boolean
}

export type ChargeStatusInfo = never

export const getChargeStatus = async (device: DeviceWithCapabilities<'chargeStatus'>): Promise<ChargeStatusData> => {
  const report = RazerReport.from({ commandClass: 0x07, commandId: 0x84, dataSize: 0x02, args: new Uint8Array(0) })
  const response = await sendReport(device, report)
  return { status: Boolean(response.args[1]) }
}
