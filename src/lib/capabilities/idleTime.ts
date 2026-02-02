import type { CapabilityCommand, CapabilityEntry, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/razer/razerReport'

export type RazerIdleTimeData = { vendor: 'razer'; seconds: number }
export type IdleTimeData = RazerIdleTimeData

export type RazerIdleTimeInfo = { vendor: 'razer'; minSeconds: number; maxSeconds: number; txId: number }
export type IdleTimeInfo = RazerIdleTimeInfo

const razerIdleTimeCommand: CapabilityCommand<'idleTime', IdleTimeData> = {
  get: async (device: DeviceWithCapabilities<'idleTime'>): Promise<IdleTimeData> => {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x83,
      dataSize: 0x02,
      args: new Uint8Array(0),
      txId: device.capabilities.idleTime.info.txId
    })
    const response = await report.sendReport(device)
    return { vendor: 'razer', seconds: (response.args[0] << 8) | (response.args[1] & 0xff) }
  },

  set: async (device: DeviceWithCapabilities<'idleTime'>, data: IdleTimeData): Promise<void> => {
    const { minSeconds, maxSeconds, txId } = device.capabilities.idleTime.info
    if (data.seconds < minSeconds || data.seconds > maxSeconds) {
      throw new Error(`Idle time seconds must be between ${minSeconds} and ${maxSeconds}`)
    }

    const args = new Uint8Array(2)
    args[0] = (data.seconds >> 8) & 0xff
    args[1] = data.seconds & 0xff

    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x03,
      dataSize: 0x02,
      args,
      txId
    })
    await report.sendReport(device)
  }
}

const razer = (minSeconds: number, maxSeconds: number, txId: number): CapabilityEntry<'idleTime'> => ({
  info: { vendor: 'razer', minSeconds, maxSeconds, txId },
  command: razerIdleTimeCommand
})

export const idleTime = { razer }
