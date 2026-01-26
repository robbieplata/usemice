import type { CapabilityCommand, DeviceWithCapabilities } from '../../device/device'
import { RazerReport } from '../../device/razer/razerReport'

export type DpiStagesData = {
  dpiLevels: [number, number][]
  activeStage: number
}

export type DpiStagesInfo = {
  minDpi: number
  maxDpi: number
  maxStages: number
  txId: number
}
/**
 * Response format (hex):
 * 01    varstore
 * 02    active DPI stage
 * 04    number of stages = 4
 *
 * 01    first DPI stage
 * 03 20 first stage DPI X = 800
 * 03 20 first stage DPI Y = 800
 * 00 00 reserved
 *
 * 02    second DPI stage
 * 07 08 second stage DPI X = 1800
 * 07 08 second stage DPI Y = 1800
 * 00 00 reserved
 */

export const dpiStages: CapabilityCommand<'dpiStages', DpiStagesData> = {
  get: async (device: DeviceWithCapabilities<'dpiStages'>): Promise<DpiStagesData> => {
    const report = RazerReport.from({
      commandClass: 0x04,
      commandId: 0x86,
      dataSize: 0x26,
      args: new Uint8Array([0x01]),
      txId: device.capabilities.dpiStages.info.txId
    })

    const response = await report.sendReport(device)
    const args = response.args
    const dataSize = Math.min(response.dataSize)

    const activeStage = args[1]
    const stagesCount = args[2]
    const dpiLevels: [number, number][] = []

    let argsOffset = 4
    for (let i = 0; i < stagesCount; i++) {
      if (argsOffset + 4 > dataSize) break
      const dpiX = (args[argsOffset] << 8) | args[argsOffset + 1]
      const dpiY = (args[argsOffset + 2] << 8) | args[argsOffset + 3]
      dpiLevels.push([dpiX, dpiY])
      argsOffset += 7
    }

    return { dpiLevels, activeStage }
  },

  set: async (device: DeviceWithCapabilities<'dpiStages'>, data: DpiStagesData): Promise<void> => {
    const { dpiLevels, activeStage } = data
    const args = new Uint8Array(0x26)
    const count = dpiLevels.length

    if (count < 1) throw new Error('At least one DPI stage must be provided')

    const maxStages = device.capabilities.dpiStages.info.maxStages
    if (count > maxStages) throw new Error(`Too many DPI stages (${count}) provided, maximum is ${maxStages}`)

    if (activeStage > count || activeStage < 1) {
      throw new Error(`Active stage (${activeStage}) out of bounds for ${count} stages`)
    }

    if (3 + 7 * count > 0x26) throw new Error(`Too many DPI stages (${count}) for 0x26-byte payload`)

    args[0] = 0x01 // varstore
    args[1] = activeStage & 0xff
    args[2] = count & 0xff

    let offset = 3
    for (let i = 0; i < count; i++) {
      const [x, y] = dpiLevels[i]
      args[offset++] = i & 0xff
      args[offset++] = (x >> 8) & 0xff
      args[offset++] = x & 0xff
      args[offset++] = (y >> 8) & 0xff
      args[offset++] = y & 0xff
      args[offset++] = 0x00
      args[offset++] = 0x00
    }

    const report = RazerReport.from({
      commandClass: 0x04,
      commandId: 0x06,
      dataSize: 0x26,
      args,
      txId: device.capabilities.dpiStages.info.txId
    })

    await report.sendReport(device)
  }
}
