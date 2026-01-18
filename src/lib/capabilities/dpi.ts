import { sendReport } from '../device/hid'
import type { Device, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'

export type DpiData = {
  x: number
  y: number
}

export type DpiInfo = {
  minDpi: number
  maxDpi: number
}

export const getDpi = async (device: Device): Promise<DpiData> => {
  const report = RazerReport.from({ commandClass: 0x04, commandId: 0x85, dataSize: 0x07, args: new Uint8Array(0) })
  const response = await sendReport(device, report)
  const x = (response.args[1] << 8) | response.args[2]
  const y = (response.args[3] << 8) | response.args[4]
  return { x, y }
}

export const setDpi = async (device: DeviceWithCapabilities<'dpi'>, dpi: DpiData): Promise<void> => {
  const report = RazerReport.from({ commandClass: 0x04, commandId: 0x05, dataSize: 0x07, args: new Uint8Array(0) })
  const { x, y } = dpi
  report.args[0] = 0x01
  report.args[1] = (x >> 8) & 0xff
  report.args[2] = x & 0xff
  report.args[3] = (y >> 8) & 0xff
  report.args[4] = y & 0xff
  report.args[5] = 0x00
  report.args[6] = 0x00
  await sendReport(device, report)
}
