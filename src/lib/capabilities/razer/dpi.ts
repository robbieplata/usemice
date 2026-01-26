import type { CapabilityCommand, DeviceWithCapabilities } from '../../device/device'
import { RazerReport } from '../../device/razerReport'

export type DpiData = {
  x: number
  y: number
}

export type DpiInfo = {
  minDpi: number
  maxDpi: number
}

export const getDpi = async (device: DeviceWithCapabilities<'dpi'>): Promise<DpiData> => {
  const report = RazerReport.from({ commandClass: 0x04, commandId: 0x85, dataSize: 0x07, args: new Uint8Array(0) })
  report.idByte = 0x00
  const response = await report.sendReport(device)
  const x = (response.args[1] << 8) | response.args[2]
  const y = (response.args[3] << 8) | response.args[4]
  return { x, y }
}

export const setDpi = async (device: DeviceWithCapabilities<'dpi'>, dpi: DpiData): Promise<void> => {
  const buffer = new ArrayBuffer(7)
  const args = new Uint8Array(buffer)
  const { x, y } = dpi
  args[0] = 0x01
  args[1] = (x >> 8) & 0xff
  args[2] = x & 0x00ff
  args[3] = (y >> 8) & 0xff
  args[4] = y & 0x00ff
  args[5] = 0x00
  args[6] = 0x00
  const report = RazerReport.from({ commandClass: 0x04, commandId: 0x05, dataSize: 0x07, args })
  await report.sendReport(device)
}

export const dpi: CapabilityCommand<'dpi', DpiData> = {
  get: getDpi,
  set: setDpi
}
