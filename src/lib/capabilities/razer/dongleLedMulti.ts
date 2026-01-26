import type { CapabilityCommand, DeviceWithCapabilities } from '../../device/device'
import { RazerReport } from '../../device/razer/razerReport'

export type DongleLedMultiData = [number, number, number]
export type DongleLedMultiInfo = { txId: number }

export const DongleLedMultiMode = {
  OFF: 0x00,
  BATTERY_STATUS: 0x01,
  CONNECTION_STATUS: 0x02,
  POLLING_RATE_INDICATOR: 0x03,
  DPI_INDICATOR: 0x04
}

export const dongleLedMulti: CapabilityCommand<'dongleLedMulti', DongleLedMultiData> = {
  get: async (_device: DeviceWithCapabilities<'dongleLedMulti'>): Promise<DongleLedMultiData> => {
    console.error('Getting dongle LED multi mode is not supported. Returning garbage values')
    return [0x00, 0x00, 0x00]
  },

  set: async (device: DeviceWithCapabilities<'dongleLedMulti'>, modes: DongleLedMultiData): Promise<void> => {
    const args = new Uint8Array([modes[0], modes[1], modes[2]])
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
