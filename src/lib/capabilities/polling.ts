import type { CapabilityCommand, CapabilityEntry, DeviceWithCapabilities } from '../device/device'
import { RazerReport } from '../device/razer/razerReport'
import { createErrorClass } from '../errors'

export type PollingData = { vendor: 'razer'; interval: number }

export type PollingInfo = {
  vendor: 'razer'
  protocol: 'legacy' | 'v2'
  supportedIntervals: number[]
  txId: number
}

export const PollingError = createErrorClass('PollingError')

enum LegacyPollingCode {
  Hz1000 = 0x01,
  Hz500 = 0x02,
  Hz125 = 0x08
}

const LEGACY_CODE_TO_INTERVAL: Record<LegacyPollingCode, number> = {
  [LegacyPollingCode.Hz1000]: 1000,
  [LegacyPollingCode.Hz500]: 500,
  [LegacyPollingCode.Hz125]: 125
}

const LEGACY_INTERVAL_TO_CODE = Object.fromEntries(
  Object.entries(LEGACY_CODE_TO_INTERVAL).map(([code, interval]) => [interval, Number(code)])
) as Record<number, LegacyPollingCode>

enum V2PollingCode {
  Hz8000 = 0x01,
  Hz4000 = 0x02,
  Hz2000 = 0x04,
  Hz1000 = 0x08,
  Hz500 = 0x10,
  Hz250 = 0x20,
  Hz125 = 0x40
}

const V2_CODE_TO_INTERVAL: Record<V2PollingCode, number> = {
  [V2PollingCode.Hz8000]: 8000,
  [V2PollingCode.Hz4000]: 4000,
  [V2PollingCode.Hz2000]: 2000,
  [V2PollingCode.Hz1000]: 1000,
  [V2PollingCode.Hz500]: 500,
  [V2PollingCode.Hz250]: 250,
  [V2PollingCode.Hz125]: 125
}

const V2_INTERVAL_TO_CODE = Object.fromEntries(
  Object.entries(V2_CODE_TO_INTERVAL).map(([code, interval]) => [interval, Number(code)])
) as Record<number, V2PollingCode>

const pollingCommand: CapabilityCommand<'polling', PollingData> = {
  get: async (device: DeviceWithCapabilities<'polling'>): Promise<PollingData> => {
    const info = device.capabilities.polling.info
    if (info.vendor === 'razer' && info.protocol === 'legacy') {
      const report = RazerReport.from({
        commandClass: 0x00,
        commandId: 0x85,
        dataSize: 0x00,
        args: new Uint8Array([]),
        txId: info.txId
      })
      const response = await report.sendReport(device)
      const value = response.args[0] as LegacyPollingCode
      const interval = LEGACY_CODE_TO_INTERVAL[value]
      if (interval === undefined) {
        throw new PollingError(`Unsupported polling interval received: 0x${value.toString(16)}`)
      }
      return { vendor: 'razer', interval }
    } else if (info.vendor === 'razer' && info.protocol === 'v2') {
      const report = RazerReport.from({
        commandClass: 0x00,
        commandId: 0xc0,
        dataSize: 0x01,
        args: new Uint8Array([0x00]),
        txId: info.txId
      })
      const response = await report.sendReport(device)
      const value = response.args[1] as V2PollingCode
      const interval = V2_CODE_TO_INTERVAL[value]
      if (interval === undefined) {
        throw new PollingError(`Unsupported polling interval received: 0x${value.toString(16)}`)
      }
      return { vendor: 'razer', interval }
    }
    throw new PollingError('Unsupported polling vendor/protocol')
  },
  set: async (device: DeviceWithCapabilities<'polling'>, data: PollingData): Promise<void> => {
    const info = device.capabilities.polling.info
    if (info.vendor === 'razer' && info.protocol === 'legacy') {
      const value = LEGACY_INTERVAL_TO_CODE[data.interval]
      if (value === undefined) {
        throw new PollingError('Unsupported polling interval set')
      }
      const report = RazerReport.from({
        commandClass: 0x00,
        commandId: 0x05,
        dataSize: 0x01,
        args: new Uint8Array([value]),
        txId: info.txId
      })
      await report.sendReport(device)
    } else if (info.vendor === 'razer' && info.protocol === 'v2') {
      const value = V2_INTERVAL_TO_CODE[data.interval]
      if (value === undefined) {
        throw new PollingError('Unsupported polling interval set')
      }
      // Some devices expect the same write twice: argument 0x00 then 0x01 (openrazer driver comment)
      for (const argument of [0x00, 0x01] as const) {
        const report = RazerReport.from({
          commandClass: 0x00,
          commandId: 0x40,
          dataSize: 0x02,
          args: new Uint8Array([argument, value]),
          txId: info.txId
        })
        await report.sendReport(device)
      }
    } else {
      throw new PollingError('Unsupported polling vendor/protocol')
    }
  }
}

const razer = (protocol: 'legacy' | 'v2', supportedIntervals: number[], txId: number): CapabilityEntry<'polling'> => ({
  info: { vendor: 'razer', protocol, supportedIntervals, txId },
  command: pollingCommand
})

export const polling = { razer }
