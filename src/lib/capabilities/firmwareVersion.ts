import { sendCommand } from '../device/hid'
import type { Device } from '../device/device'
import { RazerReport } from '../device/report'
import { PID_DEATHADDER_V4_PRO_WIRED, PID_DEATHADDER_V4_PRO_WIRELESS } from '../device/devices'

export type FirmwareVersionData = {
  version: string
}

export type FirmwareVersionLimits = never

export const getFirmwareVersion = async (device: Device): Promise<FirmwareVersionData> => {
  switch (device.hid.productId) {
    case PID_DEATHADDER_V4_PRO_WIRED:
    case PID_DEATHADDER_V4_PRO_WIRELESS: {
      const report = RazerReport.from(0x00, 0x81, 0x02, new Uint8Array(0))
      report.transactionId = 0x1f
      const response = await sendCommand(device, report)
      return { version: `v${response.args[0]}.${response.args[1]}` }
    }

    default:
      throw new Error(`No DPI implementation for device PID: 0x${device.hid.productId.toString(16)}`)
  }
}
