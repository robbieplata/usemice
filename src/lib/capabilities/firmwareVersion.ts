import type { CapabilityCommand, CapabilityEntry, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/razer/razerReport'

export type FirmwareVersionData = { vendor: 'razer'; major: number; minor: number }
export type FirmwareVersionInfo = { vendor: 'razer'; txId: number }

const firmwareVersionCommand: CapabilityCommand<'firmwareVersion', FirmwareVersionData> = {
  get: async (device: DeviceWithCapabilities<'firmwareVersion'>): Promise<FirmwareVersionData> => {
    const report = RazerReport.from({
      commandClass: 0x00,
      commandId: 0x81,
      dataSize: 0x02,
      args: new Uint8Array(0),
      txId: device.capabilities.firmwareVersion.info.txId
    })
    const response = await report.sendReport(device)
    return { vendor: 'razer', major: response.args[0], minor: response.args[1] }
  }
}

export const firmwareVersion = (txId: number): CapabilityEntry<'firmwareVersion'> => ({
  info: { vendor: 'razer', txId },
  command: firmwareVersionCommand
})
