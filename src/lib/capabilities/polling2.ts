import { sendCommand } from '../device/hid'
import type { Device } from '../device/device'
import { RazerReport } from '../device/razer_report'
import type { Adapter } from '../device/builder'

export type Polling2Data = {
  interval: number
}

export type Polling2Limits = {
  supportedIntervals: number[]
}

export type Polling2Methods = {
  getPolling: () => Promise<Polling2Data>
  setPolling: (data: Polling2Data) => Promise<void>
}

const POLLING2_CLASS = 0x00
const POLLING2_GET = 0xc0
const POLLING2_SET = 0x40

const MAPPING: Record<number, number> = {
  0x40: 125,
  0x20: 250,
  0x10: 500,
  0x08: 1000,
  0x04: 2000,
  0x02: 4000,
  0x01: 8000,

  125: 0x40,
  250: 0x20,
  500: 0x10,
  1000: 0x08,
  2000: 0x04,
  4000: 0x02,
  8000: 0x01
}

export class Polling2Error extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

export const getPolling2 = async (device: Device): Promise<Polling2Data> => {
  const report = RazerReport.from(POLLING2_CLASS, POLLING2_GET, new Uint8Array([0x00]))
  const response = await sendCommand(device, report)

  if (response.commandClass !== POLLING2_CLASS || response.commandId !== POLLING2_GET) {
    throw new Polling2Error('Invalid response for Polling2 get')
  }

  const value = response.args[1]

  const interval = MAPPING[value]
  if (interval === undefined) {
    throw new Polling2Error(`Unsupported polling interval received: 0x${value.toString(16)}`)
  }
  return { interval }
}

export const setPolling2 = async (device: Device, data: Polling2Data): Promise<void> => {
  const value = MAPPING[data.interval]
  if (value === undefined) {
    throw new Polling2Error('Unsupported polling interval set')
  }
  const report = RazerReport.from(POLLING2_CLASS, POLLING2_SET, new Uint8Array([0x00, value]))
  await sendCommand(device, report)
}

export const init = async (device: Device): Promise<Device> => {
  const data = await getPolling2(device)
  device.capabilityData.polling2 = data
  return device
}

const methods = (device: Device): Polling2Methods => ({
  getPolling: () => getPolling2(device),
  setPolling: (data) => setPolling2(device, data)
})

export const polling2Adapter = (limits: Polling2Limits): Adapter<'polling2', Polling2Limits, Polling2Methods> => ({
  key: 'polling2',
  limits,
  init,
  methods
})
