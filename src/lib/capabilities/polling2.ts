import { Effect } from 'effect'
import { sendCommand } from '../device/hid'
import type { Device } from '../device/device'
import { RazerReport } from '../device/razer_report'

export type Polling2Data = {
  interval: number
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
  readonly _tag = 'Polling2Error'
  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

export const getPolling2 = (device: Device) =>
  Effect.gen(function* () {
    const report = RazerReport.from(POLLING2_CLASS, POLLING2_GET, new Uint8Array([0x00]))
    const response = yield* sendCommand(device, report)

    if (response.commandClass !== POLLING2_CLASS || response.commandId !== POLLING2_GET) {
      return yield* Effect.fail(new Polling2Error('Invalid response for Polling2 get'))
    }

    const value = response.args[1]

    const interval = MAPPING[value]
    if (interval === undefined) {
      return yield* Effect.fail(new Polling2Error(`Unsupported polling interval received: 0x${value.toString(16)}`))
    }
    return { interval } satisfies Polling2Data
  })

export const setPolling2 = (device: Device, data: Polling2Data) =>
  Effect.gen(function* () {
    const value = MAPPING[data.interval]
    if (value === undefined) {
      return yield* Effect.fail(new Polling2Error('Unsupported polling interval set'))
    }
    const report = RazerReport.from(POLLING2_CLASS, POLLING2_SET, new Uint8Array([0x00, value]))
    yield* sendCommand(device, report)
  })

export const init_polling2 = (device: Device) =>
  Effect.flatMap(getPolling2(device), (data) => {
    device.data.polling2 = data
    return Effect.succeed(device)
  })
