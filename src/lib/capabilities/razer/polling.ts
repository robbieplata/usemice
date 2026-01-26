import type { CapabilityCommand, DeviceWithCapabilities } from '../../device/device'
import { RazerReport } from '../../device/razerReport'

export type PollingData = {
  interval: number
}

export type PollingInfo = {
  idByte: number
  supportedIntervals: number[]
}

export class PollingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PollingError'
  }
}

const MAPPING: Record<number, number> = {
  0x01: 1000,
  0x02: 500,
  0x08: 125,

  1000: 0x01,
  500: 0x02,
  125: 0x08
}

export const getPolling = async (device: DeviceWithCapabilities<'polling'>): Promise<PollingData> => {
  const report = RazerReport.from({
    commandClass: 0x00,
    commandId: 0x85,
    dataSize: 0x00,
    args: new Uint8Array([]),
    idByte: device.capabilities.polling.info.idByte
  })
  const response = await report.sendReport(device)
  const value = response.args[0]
  const interval = MAPPING[value]
  if (interval === undefined) {
    throw new PollingError(`Unsupported polling interval received: 0x${value.toString(16)}`)
  }
  return { interval }
}

export const setPolling = async (device: DeviceWithCapabilities<'polling'>, data: PollingData): Promise<void> => {
  const value = MAPPING[data.interval]
  if (value === undefined) {
    throw new PollingError('Unsupported polling interval set')
  }
  const report = RazerReport.from({
    commandClass: 0x00,
    commandId: 0x05,
    dataSize: 0x01,
    args: new Uint8Array([value]),
    idByte: device.capabilities.polling.info.idByte
  })
  await report.sendReport(device)
}

export const polling: CapabilityCommand<'polling', PollingData> = {
  get: getPolling,
  set: setPolling
}
