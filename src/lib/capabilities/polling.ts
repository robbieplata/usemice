import { sendReport } from '../device/hid'
import type { Device, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'
import { PID_DEATHADDER_V4_PRO_WIRED, PID_DEATHADDER_V4_PRO_WIRELESS } from '../device/devices'

export type PollingData = {
  interval: number
}

export type PollingInfo = {
  supportedIntervals: number[]
}

export class PollingError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message)
  }
}

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

export const getPolling = async (device: DeviceWithCapabilities<'polling'>): Promise<PollingData> => {
  const report = RazerReport.from({
    commandClass: 0x00,
    commandId: 0xc0,
    dataSize: 0x01,
    args: new Uint8Array([0x00])
  })
  const response = await sendReport(device, report)
  const value = response.args[1]
  const interval = MAPPING[value]
  if (interval === undefined) {
    throw new PollingError(`Unsupported polling interval received: 0x${value.toString(16)}`)
  }
  return { interval }
}

export const setPolling = async (device: Device, data: PollingData): Promise<void> => {
  const value = MAPPING[data.interval]
  if (value === undefined) {
    throw new PollingError('Unsupported polling interval set')
  }
  const report = RazerReport.from({
    commandClass: 0x00,
    commandId: 0x40,
    dataSize: 0x02,
    args: new Uint8Array([0x00, value])
  })
  await sendReport(device, report)
}
