import { sendReport } from '../device/hid'
import type { DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'

export type FirmwareVersionData = {
  major: number
  minor: number
}

export type FirmwareVersionInfo = never

export const getFirmwareVersion = async (
  device: DeviceWithCapabilities<'firmwareVersion'>
): Promise<FirmwareVersionData> => {
  const report = RazerReport.from({ commandClass: 0x00, commandId: 0x81, dataSize: 0x02, args: new Uint8Array(0) })
  report.idByte = 0x1f
  const response = await sendReport(device, report)
  return { major: response.args[0], minor: response.args[1] }
}
