import { sendCommand } from '../device/hid'
import type { Device } from '../device/device'
import { RazerReport } from '../device/report'
import { PID_DEATHADDER_V4_PRO_WIRED, PID_DEATHADDER_V4_PRO_WIRELESS } from '../device/devices'

export type DpiData = {
  x: number
  y: number
}

export type DpiLimits = {
  minDpi: number
  maxDpi: number
}

const COMMAND_CLASS = 0x04
const GET_COMMAND_ID = 0x85
const SET_COMMAND_ID = 0x01

export const getDpi = async (device: Device): Promise<DpiData> => {
  switch (device.hid.productId) {
    case PID_DEATHADDER_V4_PRO_WIRED:
    case PID_DEATHADDER_V4_PRO_WIRELESS: {
      const report = RazerReport.from(COMMAND_CLASS, GET_COMMAND_ID, new Uint8Array(0))
      const response = await sendCommand(device, report)
      const x = (response.args[1] << 8) | response.args[2]
      const y = (response.args[3] << 8) | response.args[4]
      return { x, y }
    }

    default:
      throw new Error(`No DPI implementation for device PID: 0x${device.hid.productId.toString(16)}`)
  }
}

export const setDpi = async (device: Device, dpi: DpiData): Promise<void> => {
  switch (device.hid.productId) {
    case PID_DEATHADDER_V4_PRO_WIRED:
    case PID_DEATHADDER_V4_PRO_WIRELESS: {
      const args = new Uint8Array(4)
      const { x } = dpi
      args[0] = (x >> 8) & 0xff
      args[1] = x & 0xff
      args[2] = (x >> 8) & 0xff
      args[3] = x & 0xff
      const report = RazerReport.from(COMMAND_CLASS, SET_COMMAND_ID, args)
      await sendCommand(device, report)
      return
    }

    default:
      throw new Error(`No DPI implementation for device PID: 0x${device.hid.productId.toString(16)}`)
  }
}
