import type { CapabilityCommand, DeviceWithCapabilities } from '../../device/device'
import { RazerReport } from '../../device/razer/razerReport'

export type ChargeLevelData = {
  percentage: number
}

export type ChargeLevelInfo = {
  idByte: number
}

export const chargeLevel: CapabilityCommand<'chargeLevel', ChargeLevelData> = {
  get: async (device: DeviceWithCapabilities<'chargeLevel'>): Promise<ChargeLevelData> => {
    const report = RazerReport.from({ commandClass: 0x07, commandId: 0x80, dataSize: 0x02, args: new Uint8Array(0) })
    const responseResult = await report.sendReport(device)
    return { percentage: (responseResult.args[1] / 0xff) * 100 }
  }
}
