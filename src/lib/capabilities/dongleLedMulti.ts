import type { CapabilityCommand, CapabilityEntry, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/razer/razerReport'

export type RazerDongleLedMultiData = { vendor: 'razer'; modes: [number, number, number] }
export type DongleLedMultiData = RazerDongleLedMultiData

export type RazerDongleLedMultiInfo = { vendor: 'razer'; txId: number }
export type DongleLedMultiInfo = RazerDongleLedMultiInfo

export const DongleLedMultiMode = {
  OFF: 0x00,
  BATTERY_STATUS: 0x01,
  CONNECTION_STATUS: 0x02,
  POLLING_RATE_INDICATOR: 0x03,
  DPI_INDICATOR: 0x04
}

const razerDongleLedMultiCommand: CapabilityCommand<'dongleLedMulti', DongleLedMultiData> = {
  get: async (device: DeviceWithCapabilities<'dongleLedMulti'>): Promise<DongleLedMultiData> => {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x95,
      dataSize: 0x03,
      args: new Uint8Array(0),
      txId: device.capabilities.dongleLedMulti.info.txId
    })
    const response = await report.sendReport(device)
    return { vendor: 'razer', modes: [response.args[0], response.args[1], response.args[2]] }
  },

  set: async (device: DeviceWithCapabilities<'dongleLedMulti'>, data: DongleLedMultiData): Promise<void> => {
    const args = new Uint8Array([data.modes[0], data.modes[1], data.modes[2]])
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x15,
      dataSize: 0x03,
      args,
      txId: device.capabilities.dongleLedMulti.info.txId
    })
    await report.sendReport(device)
  }
}

const razer = (txId: number): CapabilityEntry<'dongleLedMulti'> => ({
  info: { vendor: 'razer', txId },
  command: razerDongleLedMultiCommand
})

export const dongleLedMulti = { razer }
