import type { CapabilityCommand, DeviceWithCapabilities } from '../../device/device'
import { RazerReport } from '../../device/razer/razerReport'

export type IdleTimeData = {
  seconds: number
}

export type IdleTimeInfo = {
  minSeconds: number
  maxSeconds: number
  idByte: number
}

export const idleTime: CapabilityCommand<'idleTime', IdleTimeData> = {
  get: async (device: DeviceWithCapabilities<'idleTime'>): Promise<IdleTimeData> => {
    const report = RazerReport.from({ commandClass: 0x07, commandId: 0x83, dataSize: 0x02, args: new Uint8Array(0) })
    const response = await report.sendReport(device)
    return { seconds: (response.args[0] << 8) | (response.args[1] & 0xff) }
  },
  set: async (device: DeviceWithCapabilities<'idleTime'>, data: IdleTimeData): Promise<void> => {
    const args = new Uint8Array(2)
    const { minSeconds, maxSeconds } = device.capabilities.idleTime.info
    if (data.seconds < minSeconds || data.seconds > maxSeconds) {
      throw new Error(`Idle time seconds must be between ${minSeconds} and ${maxSeconds}`)
    }
    args[0] = (data.seconds >> 8) & 0xff
    args[1] = data.seconds & 0xff
    const report = RazerReport.from({ commandClass: 0x07, commandId: 0x03, dataSize: 0x02, args })
    await report.sendReport(device)
  }
}
