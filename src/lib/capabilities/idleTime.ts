import { sendReport } from '../device/hid'
import type { DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/report'

export type IdleTimeData = {
  seconds: number
}

export type IdleTimeInfo = {
  minSeconds: number
  maxSeconds: number
}

export const getIdleTime = async (device: DeviceWithCapabilities<'idleTime'>): Promise<IdleTimeData> => {
  const report = RazerReport.from({ commandClass: 0x07, commandId: 0x83, dataSize: 0x02, args: new Uint8Array(0) })
  const response = await sendReport(device, report)
  return { seconds: (response.args[0] << 8) | (response.args[1] & 0xff) }
}

export const setIdleTime = async (device: DeviceWithCapabilities<'idleTime'>, data: IdleTimeData): Promise<void> => {
  const args = new Uint8Array(2)
  const { minSeconds, maxSeconds } = device.capabilityInfo.idleTime
  if (data.seconds < minSeconds || data.seconds > maxSeconds) {
    throw new Error(`Idle time seconds must be between ${minSeconds} and ${maxSeconds}`)
  }
  args[0] = (data.seconds >> 8) & 0xff
  args[1] = data.seconds & 0xff
  const report = RazerReport.from({ commandClass: 0x07, commandId: 0x03, dataSize: 0x02, args })
  console.log('Setting idle time to', data.seconds)
  await sendReport(device, report)
}
