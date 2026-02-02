import type { CapabilityCommand, CapabilityEntry, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/razer/razerReport'

export type RazerSerialData = { vendor: 'razer'; serialNumber: string }
export type SerialData = RazerSerialData

export type RazerSerialInfo = { vendor: 'razer'; txId: number }
export type SerialInfo = RazerSerialInfo

const razerSerialCommand: CapabilityCommand<'serial', SerialData> = {
  get: async (device: DeviceWithCapabilities<'serial'>): Promise<SerialData> => {
    const report = RazerReport.from({
      commandClass: 0x00,
      commandId: 0x82,
      dataSize: 0x16,
      args: new Uint8Array([0x00]),
      txId: device.capabilities.serial.info.txId
    })
    const response = await report.sendReport(device)
    const bytes = response.args.slice(0, 22)
    const nullIdx = bytes.indexOf(0x00)
    const serialBytes = nullIdx === -1 ? bytes : bytes.slice(0, nullIdx)

    return { vendor: 'razer', serialNumber: new TextDecoder('utf-8').decode(serialBytes) }
  }
}

const razer = (txId: number): CapabilityEntry<'serial'> => ({
  info: { vendor: 'razer', txId },
  command: razerSerialCommand
})

export const serial = { razer }
