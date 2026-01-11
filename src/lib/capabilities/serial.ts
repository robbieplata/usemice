import { Effect } from 'effect'
import { sendCommand } from '../device/hid'
import type { Device } from '../device/device'
import { RazerReport } from '../device/razer_report'

export type DpiData = {
  dpiLevels: number[]
}

const COMMAND_CLASS = 0x00
const GET_COMMAND_ID = 0x82

export const getSerial = (device: Device) =>
  Effect.gen(function* () {
    const report = RazerReport.from(COMMAND_CLASS, GET_COMMAND_ID, new Uint8Array([0]))
    report.dataSize = 0x16
    const response = yield* sendCommand(device, report)

    const bytes = response.args.slice(0, 22)
    const nullIdx = bytes.indexOf(0x00)
    const serialBytes = nullIdx === -1 ? bytes : bytes.slice(0, nullIdx)

    return new TextDecoder('utf-8').decode(serialBytes)
  })

export const init_serial = (device: Device) =>
  Effect.gen(function* () {
    device.data.serial = yield* getSerial(device)
    return device
  })
