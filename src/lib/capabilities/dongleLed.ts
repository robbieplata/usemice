import type { CapabilityCommand, CapabilityEntry, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/razer/razerReport'

export type DongleLedData = { vendor: 'razer'; mode: number }
export type DongleLedInfo = { vendor: 'razer'; txId: number }

export const DongleLedMode = {
  CONNECTION_STATUS: 0x01,
  BATTERY_STATUS: 0x02,
  BATTERY_WARNING: 0x03
} as const

const dongleLedCommand: CapabilityCommand<'dongleLed', DongleLedData> = {
  get: async (device: DeviceWithCapabilities<'dongleLed'>): Promise<DongleLedData> => {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x90,
      dataSize: 0x01,
      args: new Uint8Array(0),
      txId: device.capabilities.dongleLed.info.txId
    })
    const response = await report.sendReport(device)
    return { vendor: 'razer', mode: response.args[0] }
  },

  set: async (device: DeviceWithCapabilities<'dongleLed'>, data: DongleLedData): Promise<void> => {
    if (data.mode < 0x01 || data.mode > 0x03) {
      throw new Error(`Invalid dongle LED mode: ${data.mode}`)
    }
    const args = new Uint8Array([data.mode])
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

export const dongleLed = (txId: number): CapabilityEntry<'dongleLed'> => ({
  info: { vendor: 'razer', txId },
  command: dongleLedCommand
})
