import type { CapabilityCommand, CapabilityEntry, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/razer/razerReport'
import { createErrorClass } from '../errors'

export const SerialError = createErrorClass('SerialError')

export type SerialData = { vendor: 'razer'; serialNumber: string }
export type SerialInfo = { vendor: 'razer'; txId: number }

const serialCommand: CapabilityCommand<'serial', SerialData> = {
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

export const serial = (txId: number): CapabilityEntry<'serial'> => ({
  info: { vendor: 'razer', txId },
  command: serialCommand
})
