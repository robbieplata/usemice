import { sendCommand } from '../device/hid'
import type { Device } from '../device/device'
import { RazerReport } from '../device/razer_report'
import type { Adapter } from '../device/builder'

export type DpiData = {
  dpiLevels: [number, number][]
  activeStage: number
}

export type DpiLimits = {
  minDpi: number
  maxDpi: number
  maxStages: number
}

export type DpiMethods = {
  getDpiStages: () => Promise<DpiData>
  getDpi: () => Promise<{ dpiLevels: number[] }>
  setDpi: (dpi: number) => Promise<void>
}

const DPI_COMMAND_CLASS = 0x04

const DPI_STAGES_GET_COMMAND_ID = 0x86
const DPI_XY_GET_COMMAND_ID = 0x85
const DPI_SET_COMMAND_ID = 0x01
/** 
* Response format (hex):
* 01    varstore
* 02    active DPI stage
* 04    number of stages = 4

* 01    first DPI stage
* 03 20 first stage DPI X = 800
* 03 20 first stage DPI Y = 800
* 00 00 reserved

* 02    second DPI stage
* 07 08 second stage DPI X = 1800
* 07 08 second stage DPI Y = 1800
* 00 00 reserved

* 03    third DPI stage
*/
export const getDpiStages = async (device: Device): Promise<DpiData> => {
  const report = RazerReport.from(DPI_COMMAND_CLASS, DPI_STAGES_GET_COMMAND_ID, new Uint8Array([0x01]))
  report.dataSize = 0x26
  const response = await sendCommand(device, report)

  if (response.commandClass !== DPI_COMMAND_CLASS || response.commandId !== DPI_STAGES_GET_COMMAND_ID) {
    throw new Error('Invalid DPI stages response')
  }

  const args = response.args
  const dataSize = Math.min(response.dataSize)

  const activeStage = args[1]
  const stagesCount = args[2]
  const dpiLevels: [number, number][] = []
  const out = new Uint8Array(1 + stagesCount * 4)
  out[0] = args[1]

  let count = 1
  let argsOffset = 4

  for (let i = 0; i < stagesCount; i++) {
    if (argsOffset + 4 > dataSize) break
    out.set(args.subarray(argsOffset, argsOffset + 4), count)
    const dpiX = (args[argsOffset] << 8) | args[argsOffset + 1]
    const dpiY = (args[argsOffset + 2] << 8) | args[argsOffset + 3]
    dpiLevels.push([dpiX, dpiY])
    count += 4
    argsOffset += 7
  }

  return { dpiLevels, activeStage }
}

export const getDpi = async (device: Device): Promise<{ dpiLevels: number[] }> => {
  const report = RazerReport.from(DPI_COMMAND_CLASS, DPI_XY_GET_COMMAND_ID, new Uint8Array(0))
  const response = await sendCommand(device, report)

  if (response.commandClass !== DPI_COMMAND_CLASS || response.commandId !== DPI_XY_GET_COMMAND_ID) {
    throw new Error('Invalid DPI response')
  }
  const dpiX = (response.args[1] << 8) | response.args[2]
  const dpiY = (response.args[3] << 8) | response.args[4]
  if (dpiX !== dpiY || dpiX < 50 || dpiX > 35000) {
    throw new Error('Invalid DPI values')
  }
  return { dpiLevels: [dpiX, dpiY] }
}

export const setDpi = async (device: Device, dpi: number): Promise<void> => {
  const args = new Uint8Array(4)
  args[0] = (dpi >> 8) & 0xff
  args[1] = dpi & 0xff
  args[2] = (dpi >> 8) & 0xff
  args[3] = dpi & 0xff
  const report = RazerReport.from(DPI_COMMAND_CLASS, DPI_SET_COMMAND_ID, args)
  await sendCommand(device, report)
}

export const init = async (device: Device): Promise<Device> => {
  const data = await getDpiStages(device)
  device.capabilityData.dpi = data
  return device
}

const methods = (device: Device): DpiMethods => ({
  getDpiStages: () => getDpiStages(device),
  getDpi: () => getDpi(device),
  setDpi: (dpi) => setDpi(device, dpi)
})

export const dpiAdapter = (limits: DpiLimits): Adapter<'dpi', DpiLimits, DpiMethods> => ({
  key: 'dpi',
  limits,
  init,
  methods
})
