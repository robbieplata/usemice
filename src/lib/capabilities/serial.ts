import { sendReport } from '../device/hid'
import type { DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'

export type SerialData = {
  serialNumber: string
}

export type SerialInfo = object

export const getSerial = async (device: DeviceWithCapabilities<'serial'>): Promise<SerialData> => {
  const report = RazerReport.from({
    commandClass: 0x00,
    commandId: 0x82,
    dataSize: 0x16,
    args: new Uint8Array([0])
  })
  const response = await sendReport(device, report)
  const bytes = response.args.slice(0, 22)
  const nullIdx = bytes.indexOf(0x00)
  const serialBytes = nullIdx === -1 ? bytes : bytes.slice(0, nullIdx)
  return { serialNumber: new TextDecoder('utf-8').decode(serialBytes) }
}
