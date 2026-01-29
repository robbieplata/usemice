import type { CapabilityCommand, DeviceWithCapabilities } from '../../device/device'
import { RazerReport } from '../../device/razer/razerReport'
import { createErrorClass } from '../../errors'

export const ChargeStatusError = createErrorClass('ChargeStatusError')

export type ChargeStatusData = { status: boolean }
export type ChargeStatusInfo = { txId: number }

export const chargeStatus: CapabilityCommand<'chargeStatus', ChargeStatusData> = {
  get: async (device: DeviceWithCapabilities<'chargeStatus'>): Promise<ChargeStatusData> => {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x84,
      dataSize: 0x02,
      args: new Uint8Array(0),
      txId: device.capabilities.chargeStatus.info.txId
    })
    const response = await report.sendReport(device)
    return { status: Boolean(response.args[1]) }
  }
}
