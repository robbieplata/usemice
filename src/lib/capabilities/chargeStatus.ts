import type { CapabilityCommand, CapabilityEntry, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/razer/razerReport'

export type RazerChargeStatusData = { vendor: 'razer'; status: boolean }
export type ChargeStatusData = RazerChargeStatusData

export type RazerChargeStatusInfo = { vendor: 'razer'; txId: number }
export type ChargeStatusInfo = RazerChargeStatusInfo

const razerChargeStatusCommand: CapabilityCommand<'chargeStatus', ChargeStatusData> = {
  get: async (device: DeviceWithCapabilities<'chargeStatus'>): Promise<ChargeStatusData> => {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x84,
      dataSize: 0x02,
      args: new Uint8Array(0),
      txId: device.capabilities.chargeStatus.info.txId
    })
    const response = await report.sendReport(device)
    return { vendor: 'razer', status: Boolean(response.args[1]) }
  }
}

const razer = (txId: number): CapabilityEntry<'chargeStatus'> => ({
  info: { vendor: 'razer', txId },
  command: razerChargeStatusCommand
})

export const chargeStatus = { razer }
