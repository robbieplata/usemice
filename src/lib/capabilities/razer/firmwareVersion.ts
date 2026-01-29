import type { CapabilityCommand, DeviceWithCapabilities } from '../../device/device'
import { RazerReport } from '../../device/razer/razerReport'
import { createErrorClass } from '../../errors'

export const FirmwareVersionError = createErrorClass('FirmwareVersionError')

export type FirmwareVersionData = { major: number; minor: number }
export type FirmwareVersionInfo = { txId: number }

export const firmwareVersion: CapabilityCommand<'firmwareVersion', FirmwareVersionData> = {
  get: async (device: DeviceWithCapabilities<'firmwareVersion'>): Promise<FirmwareVersionData> => {
    const report = RazerReport.from({
      commandClass: 0x00,
      commandId: 0x81,
      dataSize: 0x02,
      args: new Uint8Array(0),
      txId: device.capabilities.firmwareVersion.info.txId
    })
    const response = await report.sendReport(device)
    return { major: response.args[0], minor: response.args[1] }
  }
}
