import type { CapabilityCommand, CapabilityEntry, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/razer/razerReport'

export type RazerChargeLevelData = { vendor: 'razer'; percentage: number }
export type ChargeLevelData = RazerChargeLevelData

export type RazerChargeLevelInfo = { vendor: 'razer'; txId: number }
export type ChargeLevelInfo = RazerChargeLevelInfo

const razerChargeLevelCommand: CapabilityCommand<'chargeLevel', ChargeLevelData> = {
  get: async (device: DeviceWithCapabilities<'chargeLevel'>): Promise<ChargeLevelData> => {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x80,
      dataSize: 0x02,
      args: new Uint8Array(0),
      txId: device.capabilities.chargeLevel.info.txId
    })
    const response = await report.sendReport(device)
    return { vendor: 'razer', percentage: (response.args[1] / 0xff) * 100 }
  }
}

const razer = (txId: number): CapabilityEntry<'chargeLevel'> => ({
  info: { vendor: 'razer', txId },
  command: razerChargeLevelCommand
})

export const chargeLevel = { razer }
