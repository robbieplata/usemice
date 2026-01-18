import { sendReport } from '../device/hid'
import type { Device, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'
export type DpiData = {
  x: number
  y: number
}

export type DpiLimits = {
  minDpi: number
  maxDpi: number
}

export const getDpi = async (device: Device): Promise<DpiData> => {
  const report = RazerReport.from(0x04, 0x85, 0x07, new Uint8Array(0))
  const response = await sendReport(device, report)
  const x = (response.args[1] << 8) | response.args[2]
  const y = (response.args[3] << 8) | response.args[4]
  return { x, y }
}

export const setDpi = async (device: DeviceWithCapabilities<'dpi'>, dpi: DpiData): Promise<void> => {
  const args = new Uint8Array(4)
  const { x } = dpi
  args[0] = 0x01
  args[1] = (x >> 8) & 0xff
  args[2] = x & 0xff
  args[3] = (x >> 8) & 0xff
  args[4] = x & 0xff
  args[5] = 0x00
  args[6] = 0x00
  const report = RazerReport.from(0x04, 0x05, 0x07, args)
  await sendReport(device, report)
  return
}
