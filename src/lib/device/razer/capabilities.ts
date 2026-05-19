import { observable, action } from 'mobx'
import { RazerReport } from './razerReport'
import { type HidSession } from '@/lib/device/hid'
import {
  V2PollingCode,
  LegacyPollingCode,
  LEGACY_CODE_TO_INTERVAL,
  LEGACY_INTERVAL_TO_CODE,
  V2_CODE_TO_INTERVAL,
  V2_INTERVAL_TO_CODE
} from './constants'
import { getRazerDefinition, UnsupportedDeviceError } from './definitions'

export { UnsupportedDeviceError }

export interface IRazerDeviceCore extends HidSession {
  readonly type: 'razer'
}

export class RazerDpiCapability {
  readonly info: { txId: number; minDpi: number; maxDpi: number }
  @observable accessor data: { x: number; y: number }

  constructor(
    private device: IRazerDeviceCore,
    info: RazerDpiCapability['info']
  ) {
    this.info = info
    this.data = { x: 0, y: 0 }
  }

  @action
  async refresh(): Promise<void> {
    const report = RazerReport.from({
      commandClass: 0x04,
      commandId: 0x85,
      dataSize: 0x07,
      args: new Uint8Array(0),
      txId: this.info.txId
    })

    const response = await report.sendReport(this.device)
    const x = (response.args[1] << 8) | response.args[2]
    const y = (response.args[3] << 8) | response.args[4]
    this.data = { x, y }
  }

  async set(value: RazerDpiCapability['data']): Promise<void> {
    const { x, y } = value
    const args = new Uint8Array(7)
    args[0] = 0x01
    args[1] = (x >> 8) & 0xff
    args[2] = x & 0xff
    args[3] = (y >> 8) & 0xff
    args[4] = y & 0xff

    const report = RazerReport.from({
      commandClass: 0x04,
      commandId: 0x05,
      dataSize: 0x07,
      args,
      txId: this.info.txId
    })

    await report.sendReport(this.device)
    await this.refresh()
  }
}

export type RazerDpiStagesData = { dpiLevels: [number, number][]; activeStage: number }

export class RazerDpiStagesCapability {
  readonly info: { txId: number; minDpi: number; maxDpi: number; maxStages: number }
  @observable accessor data: RazerDpiStagesData

  constructor(
    private device: IRazerDeviceCore,
    info: RazerDpiStagesCapability['info']
  ) {
    this.info = info
    this.data = { dpiLevels: [], activeStage: 1 }
  }

  @action
  async refresh(): Promise<void> {
    const report = RazerReport.from({
      commandClass: 0x04,
      commandId: 0x86,
      dataSize: 0x26,
      args: new Uint8Array([0x01]),
      txId: this.info.txId
    })

    const response = await report.sendReport(this.device)
    const args = response.args
    const dataSize = response.dataSize

    const activeStage = args[1]
    const stagesCount = args[2]
    const dpiLevels: [number, number][] = []

    let argsOffset = 4
    for (let i = 0; i < stagesCount; i++) {
      if (argsOffset + 4 > dataSize) break
      const dpiX = (args[argsOffset] << 8) | args[argsOffset + 1]
      const dpiY = (args[argsOffset + 2] << 8) | args[argsOffset + 3]
      dpiLevels.push([dpiX, dpiY])
      argsOffset += 7
    }

    this.data = { dpiLevels, activeStage }
  }

  async set(value: RazerDpiStagesCapability['data']): Promise<void> {
    const { dpiLevels, activeStage } = value
    const count = dpiLevels.length

    if (count < 1) throw new Error('At least one DPI stage must be provided')
    if (count > this.info.maxStages) {
      throw new Error(`Too many DPI stages (${count}) provided, maximum is ${this.info.maxStages}`)
    }
    if (activeStage > count || activeStage < 1) {
      throw new Error(`Active stage (${activeStage}) out of bounds for ${count} stages`)
    }

    const args = new Uint8Array(0x26)
    args[0] = 0x01
    args[1] = activeStage & 0xff
    args[2] = count & 0xff

    let offset = 3
    for (let i = 0; i < count; i++) {
      const [x, y] = dpiLevels[i]
      args[offset++] = i & 0xff
      args[offset++] = (x >> 8) & 0xff
      args[offset++] = x & 0xff
      args[offset++] = (y >> 8) & 0xff
      args[offset++] = y & 0xff
      args[offset++] = 0x00
      args[offset++] = 0x00
    }

    const report = RazerReport.from({
      commandClass: 0x04,
      commandId: 0x06,
      dataSize: 0x26,
      args,
      txId: this.info.txId
    })

    await report.sendReport(this.device)
    await this.refresh()
  }

  async setActiveStage(stage: number): Promise<void> {
    await this.set({ ...this.data, activeStage: stage })
  }

  async addStage(x: number, y: number): Promise<void> {
    if (this.data.dpiLevels.length >= this.info.maxStages) {
      throw new Error(`Cannot add more stages, maximum is ${this.info.maxStages}`)
    }
    const newLevels = [...this.data.dpiLevels, [x, y] as [number, number]]
    await this.set({ ...this.data, dpiLevels: newLevels })
  }

  async removeStage(index: number): Promise<void> {
    if (this.data.dpiLevels.length <= 1) {
      throw new Error('Cannot remove the last DPI stage')
    }
    const newLevels = this.data.dpiLevels.filter((_, i) => i !== index)
    const newActiveStage =
      this.data.activeStage > index + 1
        ? this.data.activeStage - 1
        : this.data.activeStage === index + 1
          ? Math.min(this.data.activeStage, newLevels.length)
          : this.data.activeStage
    await this.set({ dpiLevels: newLevels, activeStage: newActiveStage })
  }
}

export class RazerPollingCapability {
  readonly info: { txId: number; version: 'legacy' | 'v2'; supportedIntervals: number[] }
  @observable accessor data: { interval: number }

  constructor(
    private device: IRazerDeviceCore,
    info: RazerPollingCapability['info']
  ) {
    this.info = info
    this.data = { interval: 1000 }
  }

  @action
  async refresh(): Promise<void> {
    if (this.info.version === 'legacy') {
      const report = RazerReport.from({
        commandClass: 0x00,
        commandId: 0x85,
        dataSize: 0x00,
        args: new Uint8Array([]),
        txId: this.info.txId
      })
      const response = await report.sendReport(this.device)
      const value = response.args[0] as LegacyPollingCode
      const interval = LEGACY_CODE_TO_INTERVAL[value]
      if (interval === undefined) {
        throw new Error(`Unsupported polling interval received: 0x${value.toString(16)}`)
      }
      this.data = { interval }
    } else {
      const report = RazerReport.from({
        commandClass: 0x00,
        commandId: 0xc0,
        dataSize: 0x01,
        args: new Uint8Array([0x00]),
        txId: this.info.txId
      })
      const response = await report.sendReport(this.device)
      const value = response.args[1] as V2PollingCode
      const interval = V2_CODE_TO_INTERVAL[value]
      if (interval === undefined) {
        throw new Error(`Unsupported polling interval received: 0x${value.toString(16)}`)
      }
      this.data = { interval }
    }
  }

  async set(value: RazerPollingCapability['data']): Promise<void> {
    if (this.info.version === 'legacy') {
      const code = LEGACY_INTERVAL_TO_CODE[value.interval]
      if (code === undefined) {
        throw new Error(`Unsupported polling interval: ${value.interval}`)
      }
      const report = RazerReport.from({
        commandClass: 0x00,
        commandId: 0x05,
        dataSize: 0x01,
        args: new Uint8Array([code]),
        txId: this.info.txId
      })
      await report.sendReport(this.device)
    } else {
      const code = V2_INTERVAL_TO_CODE[value.interval]
      if (code === undefined) {
        throw new Error(`Unsupported polling interval: ${value.interval}`)
      }
      for (const argument of [0x00, 0x01] as const) {
        const report = RazerReport.from({
          commandClass: 0x00,
          commandId: 0x40,
          dataSize: 0x02,
          args: new Uint8Array([argument, code]),
          txId: this.info.txId
        })
        await report.sendReport(this.device)
      }
    }
    await this.refresh()
  }
}

export class RazerChargeLevelCapability {
  readonly info: { txId: number }
  @observable accessor data: { percentage: number }

  constructor(
    private device: IRazerDeviceCore,
    info: RazerChargeLevelCapability['info']
  ) {
    this.info = info
    this.data = { percentage: 0 }
  }

  @action
  async refresh(): Promise<void> {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x80,
      dataSize: 0x02,
      args: new Uint8Array(0),
      txId: this.info.txId
    })
    const response = await report.sendReport(this.device)
    this.data = { percentage: (response.args[1] / 0xff) * 100 }
  }
}

export class RazerChargeStatusCapability {
  readonly info: { txId: number }
  @observable accessor data: { status: boolean }

  constructor(
    private device: IRazerDeviceCore,
    info: RazerChargeStatusCapability['info']
  ) {
    this.info = info
    this.data = { status: false }
  }

  @action
  async refresh(): Promise<void> {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x84,
      dataSize: 0x02,
      args: new Uint8Array(0),
      txId: this.info.txId
    })
    const response = await report.sendReport(this.device)
    this.data = { status: Boolean(response.args[1]) }
  }
}

export class RazerIdleTimeCapability {
  readonly info: { txId: number; minSeconds: number; maxSeconds: number }
  @observable accessor data: { seconds: number }

  constructor(
    private device: IRazerDeviceCore,
    info: RazerIdleTimeCapability['info']
  ) {
    this.info = info
    this.data = { seconds: 0 }
  }

  @action
  async refresh(): Promise<void> {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x83,
      dataSize: 0x02,
      args: new Uint8Array(0),
      txId: this.info.txId
    })
    const response = await report.sendReport(this.device)
    this.data = { seconds: (response.args[0] << 8) | (response.args[1] & 0xff) }
  }

  async set(value: RazerIdleTimeCapability['data']): Promise<void> {
    if (value.seconds < this.info.minSeconds || value.seconds > this.info.maxSeconds) {
      throw new Error(`Idle time must be between ${this.info.minSeconds} and ${this.info.maxSeconds} seconds`)
    }

    const args = new Uint8Array(2)
    args[0] = (value.seconds >> 8) & 0xff
    args[1] = value.seconds & 0xff

    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x03,
      dataSize: 0x02,
      args,
      txId: this.info.txId
    })
    await report.sendReport(this.device)
    await this.refresh()
  }
}

export class RazerFirmwareVersionCapability {
  readonly info: { txId: number }
  @observable accessor data: { major: number; minor: number }

  constructor(
    private device: IRazerDeviceCore,
    info: RazerFirmwareVersionCapability['info']
  ) {
    this.info = info
    this.data = { major: 0, minor: 0 }
  }

  @action
  async refresh(): Promise<void> {
    const report = RazerReport.from({
      commandClass: 0x00,
      commandId: 0x81,
      dataSize: 0x02,
      args: new Uint8Array(0),
      txId: this.info.txId
    })
    const response = await report.sendReport(this.device)
    this.data = { major: response.args[0], minor: response.args[1] }
  }
}

export class RazerSerialCapability {
  readonly info: { txId: number }
  @observable accessor data: { serialNumber: string }

  constructor(
    private device: IRazerDeviceCore,
    info: RazerSerialCapability['info']
  ) {
    this.info = info
    this.data = { serialNumber: '' }
  }

  @action
  async refresh(): Promise<void> {
    const report = RazerReport.from({
      commandClass: 0x00,
      commandId: 0x82,
      dataSize: 0x16,
      args: new Uint8Array([0x00]),
      txId: this.info.txId
    })
    const response = await report.sendReport(this.device)
    const bytes = response.args.slice(0, 22)
    const nullIdx = bytes.indexOf(0x00)
    const serialBytes = nullIdx === -1 ? bytes : bytes.slice(0, nullIdx)
    this.data = { serialNumber: new TextDecoder('utf-8').decode(serialBytes) }
  }
}

export class RazerDongleLedCapability {
  readonly info: { txId: number }
  @observable accessor data: { mode: number }

  constructor(
    private device: IRazerDeviceCore,
    info: RazerDongleLedCapability['info']
  ) {
    this.info = info
    this.data = { mode: 0 }
  }

  @action
  async refresh(): Promise<void> {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x90,
      dataSize: 0x01,
      args: new Uint8Array(0),
      txId: this.info.txId
    })
    const response = await report.sendReport(this.device)
    this.data = { mode: response.args[0] }
  }

  async set(value: RazerDongleLedCapability['data']): Promise<void> {
    if (value.mode < 0x01 || value.mode > 0x03) {
      throw new Error(`Invalid dongle LED mode: ${value.mode}`)
    }
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x10,
      dataSize: 0x01,
      args: new Uint8Array([value.mode]),
      txId: this.info.txId
    })
    await report.sendReport(this.device)
    await this.refresh()
  }
}

export class RazerDongleLedMultiCapability {
  readonly info: { txId: number }
  @observable accessor data: { modes: [number, number, number] }

  constructor(
    private device: IRazerDeviceCore,
    info: RazerDongleLedMultiCapability['info']
  ) {
    this.info = info
    this.data = { modes: [0, 0, 0] }
  }

  @action
  async refresh(): Promise<void> {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x95,
      dataSize: 0x03,
      args: new Uint8Array(0),
      txId: this.info.txId
    })
    const response = await report.sendReport(this.device)
    this.data = { modes: [response.args[0], response.args[1], response.args[2]] }
  }

  async set(value: RazerDongleLedMultiCapability['data']): Promise<void> {
    const report = RazerReport.from({
      commandClass: 0x07,
      commandId: 0x15,
      dataSize: 0x03,
      args: new Uint8Array(value.modes),
      txId: this.info.txId
    })
    await report.sendReport(this.device)
    await this.refresh()
  }
}

export type RazerCapabilityClasses = {
  chargeLevel: RazerChargeLevelCapability
  chargeStatus: RazerChargeStatusCapability
  dpi: RazerDpiCapability
  dpiStages: RazerDpiStagesCapability
  dongleLed: RazerDongleLedCapability
  dongleLedMulti: RazerDongleLedMultiCapability
  firmwareVersion: RazerFirmwareVersionCapability
  idleTime: RazerIdleTimeCapability
  polling: RazerPollingCapability
  serial: RazerSerialCapability
}

export type RazerCapabilityKey = keyof RazerCapabilityClasses
export type RazerCapabilityInfoMap = { [K in RazerCapabilityKey]: RazerCapabilityClasses[K]['info'] }
export type RazerCapabilityDataMap = { [K in RazerCapabilityKey]: RazerCapabilityClasses[K]['data'] }

export type DiscoveredRazerCapabilities = {
  [K in RazerCapabilityKey]?: RazerCapabilityClasses[K]
}

export async function discoverRazerCapabilities(device: IRazerDeviceCore): Promise<DiscoveredRazerCapabilities> {
  const definition = getRazerDefinition(device.hid)
  const capabilities: DiscoveredRazerCapabilities = {}

  if (definition.chargeLevel) {
    capabilities.chargeLevel = new RazerChargeLevelCapability(device, definition.chargeLevel)
    await capabilities.chargeLevel.refresh()
  }

  if (definition.chargeStatus) {
    capabilities.chargeStatus = new RazerChargeStatusCapability(device, definition.chargeStatus)
    await capabilities.chargeStatus.refresh()
  }

  if (definition.dpi) {
    capabilities.dpi = new RazerDpiCapability(device, definition.dpi)
    await capabilities.dpi.refresh()
  }

  if (definition.dpiStages) {
    capabilities.dpiStages = new RazerDpiStagesCapability(device, definition.dpiStages)
    await capabilities.dpiStages.refresh()
  }

  if (definition.dongleLed) {
    capabilities.dongleLed = new RazerDongleLedCapability(device, definition.dongleLed)
    await capabilities.dongleLed.refresh()
  }

  if (definition.dongleLedMulti) {
    capabilities.dongleLedMulti = new RazerDongleLedMultiCapability(device, definition.dongleLedMulti)
    await capabilities.dongleLedMulti.refresh()
  }

  if (definition.firmwareVersion) {
    capabilities.firmwareVersion = new RazerFirmwareVersionCapability(device, definition.firmwareVersion)
    await capabilities.firmwareVersion.refresh()
  }

  if (definition.idleTime) {
    capabilities.idleTime = new RazerIdleTimeCapability(device, definition.idleTime)
    await capabilities.idleTime.refresh()
  }

  if (definition.polling) {
    capabilities.polling = new RazerPollingCapability(device, definition.polling)
    await capabilities.polling.refresh()
  }

  if (definition.serial) {
    capabilities.serial = new RazerSerialCapability(device, definition.serial)
    await capabilities.serial.refresh()
  }

  return capabilities
}
