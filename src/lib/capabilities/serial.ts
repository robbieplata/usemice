import { sendCommand } from '../device/hid'
import type { Device } from '../device/device'
import { RazerReport } from '../device/razer_report'
import type { Adapter } from '../device/builder'

export type SerialData = string

export type SerialLimits = Record<string, never>

export type SerialMethods = {
  getSerial: () => Promise<string>
}

const COMMAND_CLASS = 0x00
const GET_COMMAND_ID = 0x82

export const getSerial = async (device: Device): Promise<string> => {
  const report = RazerReport.from(COMMAND_CLASS, GET_COMMAND_ID, new Uint8Array([0]))
  report.dataSize = 0x16
  const response = await sendCommand(device, report)

  const bytes = response.args.slice(0, 22)
  const nullIdx = bytes.indexOf(0x00)
  const serialBytes = nullIdx === -1 ? bytes : bytes.slice(0, nullIdx)

  return new TextDecoder('utf-8').decode(serialBytes)
}

export const init = async (device: Device): Promise<Device> => {
  device.capabilityData.serial = await getSerial(device)
  return device
}

const methods = (device: Device): SerialMethods => ({
  getSerial: () => getSerial(device)
})

export const serialAdapter = (): Adapter<'serial', SerialLimits, SerialMethods> => ({
  key: 'serial',
  limits: {},
  init,
  methods
})
