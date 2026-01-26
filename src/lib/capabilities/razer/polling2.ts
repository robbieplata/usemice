import type { CapabilityCommand, DeviceWithCapabilities } from '../../device/device'
import { RazerReport } from '../../device/razer/razerReport'

export type Polling2Data = {
  interval: number
}

export type Polling2Info = {
  supportedIntervals: number[]
  txId: number
}

export class Polling2Error extends Error {
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

export const polling2: CapabilityCommand<'polling2', Polling2Data> = {
  get: async (device: DeviceWithCapabilities<'polling2'>): Promise<Polling2Data> => {
    const report = RazerReport.from({
      commandClass: 0x00,
      commandId: 0xc0,
      dataSize: 0x01,
      args: new Uint8Array([0x00]),
      txId: device.capabilities.polling2.info.txId
    })
    const response = await report.sendReport(device)
    const value = response.args[1]
    const interval = MAPPING[value]
    if (interval === undefined) {
      throw new Polling2Error(`Unsupported polling2 interval received: 0x${value.toString(16)}`)
    }
    return { interval }
  },
  set: async (device: DeviceWithCapabilities<'polling2'>, data: Polling2Data): Promise<void> => {
    const value = MAPPING[data.interval]
    if (value === undefined) {
      throw new Polling2Error('Unsupported polling2 interval set')
    }
    // Some devices expect the same write twice: argument 0x00 then 0x01 (openrazer driver comment)
    // Doing both is usually safe, and avoids per-device branching
    for (const argument of [0x00, 0x01] as const) {
      const report = RazerReport.from({
        commandClass: 0x00,
        commandId: 0x40,
        dataSize: 0x02,
        args: new Uint8Array([argument, value]),
        txId: device.capabilities.polling2.info.txId
      })
      await report.sendReport(device)
    }
  }
}
