import type { CapabilityCommand, CapabilityEntry, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/razer/razerReport'
import { createErrorClass } from '../errors'

export const ChargeLevelError = createErrorClass('ChargeLevelError')

export type ChargeLevelData = { vendor: 'razer'; percentage: number }
export type ChargeLevelInfo = { vendor: 'razer'; txId: number }

const chargeLevelCommand: CapabilityCommand<'chargeLevel', ChargeLevelData> = {
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

export const chargeLevel = (txId: number): CapabilityEntry<'chargeLevel'> => ({
  info: { vendor: 'razer', txId },
  command: chargeLevelCommand
})
