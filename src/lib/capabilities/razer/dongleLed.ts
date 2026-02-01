import type { CapabilityCommand, DeviceWithCapabilities } from '../../device/device'
import { RazerReport } from '../../device/razer/razerReport'
import { createErrorClass } from '../../errors'

export const DongleLedError = createErrorClass('DongleLedError')

export type DongleLedData = number
export type DongleLedInfo = { txId: number }

export const DongleLedMode = {
  CONNECTION_STATUS: 0x01,
  BATTERY_STATUS: 0x02,
  BATTERY_WARNING: 0x03
} as const

export const dongleLed: CapabilityCommand<'dongleLed', DongleLedData> = {
  get: async (device: DeviceWithCapabilities<'dongleLed'>): Promise<DongleLedData> => {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x90,
      dataSize: 0x01,
      args: new Uint8Array(0),
      txId: device.capabilities.dongleLed.info.txId
    })
    const response = await report.sendReport(device)
    return response.args[0]
  },

  set: async (device: DeviceWithCapabilities<'dongleLed'>, mode: DongleLedData): Promise<void> => {
    if (mode < 0x01 || mode > 0x03) {
      throw new DongleLedError(`Invalid dongle LED mode: ${mode}`)
    }
    const args = new Uint8Array([mode])
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x10,
      dataSize: 0x01,
      args,
      txId: device.capabilities.dongleLed.info.txId
    })
    await report.sendReport(device)
  }
}
