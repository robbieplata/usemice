import { sendReport } from '../device/hid'
import type { DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'
import { PID_DEATHADDER_V4_PRO_WIRED, PID_DEATHADDER_V4_PRO_WIRELESS } from '../device/devices'

export type IdleTimeData = {
  seconds: number
}

export type IdleTimeLimits = {
  minSeconds: number
  maxSeconds: number
}

export const getIdleTime = async (device: DeviceWithCapabilities<'idleTime'>): Promise<IdleTimeData> => {
  switch (device.hid.productId) {
    case PID_DEATHADDER_V4_PRO_WIRED:
    case PID_DEATHADDER_V4_PRO_WIRELESS: {
      const report = RazerReport.from(0x07, 0x83, 0x02, new Uint8Array(0))
      const response = await sendReport(device, report)
      return { seconds: (response.args[0] << 8) | (response.args[1] & 0xff) }
    }

    default:
      throw new Error(`No IdleTime implementation for device PID: 0x${device.hid.productId.toString(16)}`)
  }
}

export const setIdleTime = async (device: DeviceWithCapabilities<'idleTime'>, data: IdleTimeData): Promise<void> => {
  switch (device.hid.productId) {
    case PID_DEATHADDER_V4_PRO_WIRED:
    case PID_DEATHADDER_V4_PRO_WIRELESS: {
      const args = new Uint8Array(2)
      const { minSeconds, maxSeconds } = device.limits.idleTime
      if (data.seconds < minSeconds || data.seconds > maxSeconds) {
        throw new Error(`Idle time seconds must be between ${minSeconds} and ${maxSeconds}`)
      }
      args[0] = (data.seconds >> 8) & 0xff
      args[1] = data.seconds & 0xff
      const report = RazerReport.from(0x07, 0x03, 0x02, args)
      await sendReport(device, report)
      return
    }

    default:
      throw new Error(`No IdleTime implementation for device PID: 0x${device.hid.productId.toString(16)}`)
  }
}
