import { Effect } from 'effect'
import { sendAndReceive } from '../device/hid'
import type { Device } from '../device/device'
import { RazerReport } from '../device/razer_report'

export type DpiData = {
  dpiLevels: number[]
}

const COMMAND_CLASS = 0x00
const GET_COMMAND_ID = 0x82

export const getSerial = (device: Device) =>
  Effect.gen(function* () {
    const report = RazerReport.from(0x1f, COMMAND_CLASS, GET_COMMAND_ID, new Uint8Array([0]))
    const response = yield* sendAndReceive(device.hid, report)
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(response.args.slice(0, 22))
  })

export const init_serial = (device: Device) =>
  Effect.gen(function* () {
    device.data.serial = yield* getSerial(device)
    return device
  })
