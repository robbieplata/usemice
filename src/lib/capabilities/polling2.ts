import { Effect } from 'effect'
import { buildRazerReport, sendFeatureReport, receiveFeatureReport } from '../device/hid'
import type { Device } from '../device/device'

export type Polling2Data = {
  interval: number
}

const POLLING2_CLASS = 0x00
const POLLING2_GET = 0x84
const POLLING2_SET = 0x04

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

export const getPolling2 = (hid: HIDDevice) =>
  Effect.gen(function* () {
    const report = buildRazerReport(0x01, 0x00, POLLING2_CLASS, POLLING2_GET, new Uint8Array(0))
    yield* sendFeatureReport(hid, report)
    const response = yield* receiveFeatureReport(hid)
    if (response[6] !== POLLING2_CLASS || response[7] !== POLLING2_GET) {
      return yield* Effect.fail(new Polling2Error('Invalid response for Polling2 get'))
    }
    const value = response[8]

    const interval = MAPPING[value]
    if (interval === undefined) {
      return yield* Effect.fail(new Polling2Error('Unsupported polling interval received'))
    }
    return { interval } satisfies Polling2Data
  })

export const setPolling2 = (hid: HIDDevice, data: Polling2Data) =>
  Effect.gen(function* (_) {
    const value = MAPPING[data.interval]
    if (value === undefined) {
      return yield* Effect.fail(new Polling2Error('Unsupported polling interval set'))
    }
    const args = new Uint8Array([value])
    const report = buildRazerReport(0x01, 0x01, POLLING2_CLASS, POLLING2_SET, args)
    yield* sendFeatureReport(hid, report)
  })

export const polling2 = (device: Device) =>
  Effect.gen(function* () {
    device.data.polling2 = yield* getPolling2(device.hid)
    return device
  })
