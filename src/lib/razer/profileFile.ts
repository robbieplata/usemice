import { DongleLedMode, DongleLedMultiMode } from './constants.ts'
import type { DiscoveredRazerCapabilities, RazerDpiStagesData } from './capabilities.ts'

const MAGIC = [0x55, 0x4d, 0x52, 0x50] as const // UMRP
const VERSION = 1
const CHECKSUM_SIZE = 4
const UINT32_MAX = 0xffffffff
const DONGLE_LED_MODES: number[] = Object.values(DongleLedMode)
const DONGLE_LED_MULTI_MODES: number[] = Object.values(DongleLedMultiMode)

const enum RazerProfileRecordType {
  Dpi = 1,
  DpiStages = 2,
  Polling = 3,
  IdleTime = 4,
  DongleLed = 5,
  DongleLedMulti = 6,
}

export type RazerSettingsProfileData = {
  dpi?: { x: number; y: number }
  dpiStages?: RazerDpiStagesData
  polling?: { interval: number }
  idleTime?: { seconds: number }
  dongleLed?: { mode: number }
  dongleLedMulti?: { modes: [number, number, number] }
}

export class RazerProfileFileError extends Error {
  override readonly name = 'RazerProfileFileError'
}

class BinaryWriter {
  private readonly bytes: number[] = []

  writeUint8(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > 0xff) throw new RazerProfileFileError('Invalid uint8 value')
    this.bytes.push(value)
  }

  writeUint16(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > 0xffff) throw new RazerProfileFileError('Invalid uint16 value')
    this.bytes.push(value & 0xff, (value >> 8) & 0xff)
  }

  writeUint32(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > UINT32_MAX) {
      throw new RazerProfileFileError('Invalid uint32 value')
    }
    this.bytes.push(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff)
  }

  writeBytes(bytes: Uint8Array): void {
    this.bytes.push(...bytes)
  }

  toBytes(): Uint8Array {
    return new Uint8Array(this.bytes)
  }
}

class BinaryReader {
  private offset = 0

  constructor(private readonly bytes: Uint8Array) {}

  readUint8(): number {
    this.require(1)
    return this.bytes[this.offset++]
  }

  readUint16(): number {
    this.require(2)
    const value = this.bytes[this.offset] | (this.bytes[this.offset + 1] << 8)
    this.offset += 2
    return value
  }

  readUint32(): number {
    this.require(4)
    const value = this.bytes[this.offset] |
      (this.bytes[this.offset + 1] << 8) |
      (this.bytes[this.offset + 2] << 16) |
      (this.bytes[this.offset + 3] << 24)
    this.offset += 4
    return value >>> 0
  }

  readBytes(length: number): Uint8Array {
    this.require(length)
    const value = this.bytes.slice(this.offset, this.offset + length)
    this.offset += length
    return value
  }

  get done(): boolean {
    return this.offset === this.bytes.length
  }

  private require(length: number): void {
    if (this.offset + length > this.bytes.length) throw new RazerProfileFileError('Profile file is truncated')
  }
}

export function exportRazerSettingsProfile(capabilities: DiscoveredRazerCapabilities): Uint8Array {
  return encodeRazerProfileFile(readRazerSettingsProfile(capabilities))
}

export async function importRazerSettingsProfile(
  capabilities: DiscoveredRazerCapabilities,
  bytes: Uint8Array,
): Promise<void> {
  const profile = decodeRazerProfileFile(bytes)
  validateRazerSettingsProfile(profile, capabilities)

  if (profile.dpi && capabilities.dpi) await capabilities.dpi.set(profile.dpi)
  if (profile.dpiStages && capabilities.dpiStages) await capabilities.dpiStages.set(profile.dpiStages)
  if (profile.polling && capabilities.polling) await capabilities.polling.set(profile.polling)
  if (profile.idleTime && capabilities.idleTime) await capabilities.idleTime.set(profile.idleTime)
  if (profile.dongleLed && capabilities.dongleLed) await capabilities.dongleLed.set(profile.dongleLed)
  if (profile.dongleLedMulti && capabilities.dongleLedMulti) {
    await capabilities.dongleLedMulti.set(profile.dongleLedMulti)
  }
}

export function readRazerSettingsProfile(capabilities: DiscoveredRazerCapabilities): RazerSettingsProfileData {
  return {
    ...(capabilities.dpi ? { dpi: capabilities.dpi.data } : {}),
    ...(capabilities.dpiStages ? { dpiStages: capabilities.dpiStages.data } : {}),
    ...(capabilities.polling ? { polling: capabilities.polling.data } : {}),
    ...(capabilities.idleTime ? { idleTime: capabilities.idleTime.data } : {}),
    ...(capabilities.dongleLed ? { dongleLed: capabilities.dongleLed.data } : {}),
    ...(capabilities.dongleLedMulti ? { dongleLedMulti: capabilities.dongleLedMulti.data } : {}),
  }
}

export function encodeRazerProfileFile(data: RazerSettingsProfileData): Uint8Array {
  validateSerializableProfile(data)

  const records = profileRecords(data)
  const writer = new BinaryWriter()
  writer.writeBytes(new Uint8Array(MAGIC))
  writer.writeUint8(VERSION)
  writer.writeUint8(records.length)
  writer.writeUint16(0)

  for (const [type, payload] of records) {
    writer.writeUint8(type)
    writer.writeUint16(payload.length)
    writer.writeBytes(payload)
  }

  const body = writer.toBytes()
  const out = new Uint8Array(body.length + CHECKSUM_SIZE)
  out.set(body)
  new DataView(out.buffer).setUint32(body.length, crc32(body), true)
  return out
}

export function decodeRazerProfileFile(bytes: Uint8Array): RazerSettingsProfileData {
  if (bytes.length < MAGIC.length + 4 + CHECKSUM_SIZE) throw new RazerProfileFileError('Profile file is too short')

  const body = bytes.slice(0, -CHECKSUM_SIZE)
  const expectedChecksum = new DataView(bytes.buffer, bytes.byteOffset + body.length, CHECKSUM_SIZE).getUint32(0, true)
  const actualChecksum = crc32(body)
  if (expectedChecksum !== actualChecksum) throw new RazerProfileFileError('Profile file checksum is invalid')

  const reader = new BinaryReader(body)
  for (const byte of MAGIC) {
    if (reader.readUint8() !== byte) throw new RazerProfileFileError('Profile file type is not supported')
  }
  const version = reader.readUint8()
  if (version !== VERSION) throw new RazerProfileFileError(`Unsupported profile file version: ${version}`)

  const recordCount = reader.readUint8()
  reader.readUint16()

  const profile: RazerSettingsProfileData = {}
  const seen = new Set<number>()
  for (let i = 0; i < recordCount; i++) {
    const type = reader.readUint8()
    const payload = new BinaryReader(reader.readBytes(reader.readUint16()))
    if (seen.has(type)) throw new RazerProfileFileError('Profile file contains duplicate settings')
    seen.add(type)

    switch (type) {
      case RazerProfileRecordType.Dpi:
        profile.dpi = { x: payload.readUint16(), y: payload.readUint16() }
        break
      case RazerProfileRecordType.DpiStages: {
        const activeStage = payload.readUint8()
        const count = payload.readUint8()
        const dpiLevels: [number, number][] = []
        for (let stage = 0; stage < count; stage++) dpiLevels.push([payload.readUint16(), payload.readUint16()])
        profile.dpiStages = { activeStage, dpiLevels }
        break
      }
      case RazerProfileRecordType.Polling:
        profile.polling = { interval: payload.readUint16() }
        break
      case RazerProfileRecordType.IdleTime:
        profile.idleTime = { seconds: payload.readUint16() }
        break
      case RazerProfileRecordType.DongleLed:
        profile.dongleLed = { mode: payload.readUint8() }
        break
      case RazerProfileRecordType.DongleLedMulti:
        profile.dongleLedMulti = { modes: [payload.readUint8(), payload.readUint8(), payload.readUint8()] }
        break
      default:
        throw new RazerProfileFileError(`Unsupported profile setting type: ${type}`)
    }

    if (!payload.done) throw new RazerProfileFileError('Profile file contains malformed setting data')
  }

  if (!reader.done) throw new RazerProfileFileError('Profile file contains unexpected trailing data')
  validateSerializableProfile(profile)
  return profile
}

export function validateRazerSettingsProfile(
  profile: RazerSettingsProfileData,
  capabilities: DiscoveredRazerCapabilities,
): void {
  if (profile.dpi) {
    if (!capabilities.dpi) throw new RazerProfileFileError('Profile includes DPI, but this device does not support it')
    validateDpiValue(profile.dpi.x, capabilities.dpi.info.minDpi, capabilities.dpi.info.maxDpi, 'DPI X')
    validateDpiValue(profile.dpi.y, capabilities.dpi.info.minDpi, capabilities.dpi.info.maxDpi, 'DPI Y')
  }

  if (profile.dpiStages) {
    if (!capabilities.dpiStages) {
      throw new RazerProfileFileError('Profile includes DPI stages, but this device does not support them')
    }
    const { minDpi, maxDpi, maxStages } = capabilities.dpiStages.info
    const { dpiLevels, activeStage } = profile.dpiStages
    if (dpiLevels.length < 1) throw new RazerProfileFileError('Profile must include at least one DPI stage')
    if (dpiLevels.length > maxStages) {
      throw new RazerProfileFileError(`Profile has too many DPI stages; maximum is ${maxStages}`)
    }
    if (activeStage < 1 || activeStage > dpiLevels.length) {
      throw new RazerProfileFileError('Active DPI stage is out of range')
    }
    for (const [x, y] of dpiLevels) {
      validateDpiValue(x, minDpi, maxDpi, 'DPI stage X')
      validateDpiValue(y, minDpi, maxDpi, 'DPI stage Y')
    }
  }

  if (profile.polling) {
    if (!capabilities.polling) {
      throw new RazerProfileFileError('Profile includes polling, but this device does not support it')
    }
    if (!capabilities.polling.info.supportedIntervals.includes(profile.polling.interval)) {
      throw new RazerProfileFileError(`Polling interval ${profile.polling.interval} Hz is not supported by this device`)
    }
  }

  if (profile.idleTime) {
    if (!capabilities.idleTime) {
      throw new RazerProfileFileError('Profile includes idle time, but this device does not support it')
    }
    const { minSeconds, maxSeconds } = capabilities.idleTime.info
    if (profile.idleTime.seconds < minSeconds || profile.idleTime.seconds > maxSeconds) {
      throw new RazerProfileFileError(`Idle time must be between ${minSeconds} and ${maxSeconds} seconds`)
    }
  }

  if (profile.dongleLed) {
    if (!capabilities.dongleLed) {
      throw new RazerProfileFileError('Profile includes dongle LED, but this device does not support it')
    }
    if (!DONGLE_LED_MODES.includes(profile.dongleLed.mode)) {
      throw new RazerProfileFileError(`Invalid dongle LED mode: ${profile.dongleLed.mode}`)
    }
  }

  if (profile.dongleLedMulti) {
    if (!capabilities.dongleLedMulti) {
      throw new RazerProfileFileError('Profile includes multi dongle LED, but this device does not support it')
    }
    for (const mode of profile.dongleLedMulti.modes) {
      if (!DONGLE_LED_MULTI_MODES.includes(mode)) {
        throw new RazerProfileFileError(`Invalid multi dongle LED mode: ${mode}`)
      }
    }
  }
}

function profileRecords(data: RazerSettingsProfileData): [RazerProfileRecordType, Uint8Array][] {
  const records: [RazerProfileRecordType, Uint8Array][] = []
  if (data.dpi) {
    const writer = new BinaryWriter()
    writer.writeUint16(data.dpi.x)
    writer.writeUint16(data.dpi.y)
    records.push([RazerProfileRecordType.Dpi, writer.toBytes()])
  }
  if (data.dpiStages) {
    const writer = new BinaryWriter()
    writer.writeUint8(data.dpiStages.activeStage)
    writer.writeUint8(data.dpiStages.dpiLevels.length)
    for (const [x, y] of data.dpiStages.dpiLevels) {
      writer.writeUint16(x)
      writer.writeUint16(y)
    }
    records.push([RazerProfileRecordType.DpiStages, writer.toBytes()])
  }
  if (data.polling) {
    const writer = new BinaryWriter()
    writer.writeUint16(data.polling.interval)
    records.push([RazerProfileRecordType.Polling, writer.toBytes()])
  }
  if (data.idleTime) {
    const writer = new BinaryWriter()
    writer.writeUint16(data.idleTime.seconds)
    records.push([RazerProfileRecordType.IdleTime, writer.toBytes()])
  }
  if (data.dongleLed) {
    const writer = new BinaryWriter()
    writer.writeUint8(data.dongleLed.mode)
    records.push([RazerProfileRecordType.DongleLed, writer.toBytes()])
  }
  if (data.dongleLedMulti) {
    const writer = new BinaryWriter()
    for (const mode of data.dongleLedMulti.modes) writer.writeUint8(mode)
    records.push([RazerProfileRecordType.DongleLedMulti, writer.toBytes()])
  }
  return records
}

function validateSerializableProfile(profile: RazerSettingsProfileData): void {
  if (Object.keys(profile).length === 0) throw new RazerProfileFileError('Profile does not contain any settings')
  if (profile.dpi) {
    validateUint16(profile.dpi.x, 'DPI X')
    validateUint16(profile.dpi.y, 'DPI Y')
  }
  if (profile.dpiStages) {
    if (
      !Number.isInteger(profile.dpiStages.activeStage) || profile.dpiStages.activeStage < 1 ||
      profile.dpiStages.activeStage > 0xff
    ) {
      throw new RazerProfileFileError('Active DPI stage is out of range')
    }
    if (profile.dpiStages.dpiLevels.length < 1 || profile.dpiStages.dpiLevels.length > 0xff) {
      throw new RazerProfileFileError('DPI stage count is out of range')
    }
    for (const [x, y] of profile.dpiStages.dpiLevels) {
      validateUint16(x, 'DPI stage X')
      validateUint16(y, 'DPI stage Y')
    }
  }
  if (profile.polling) validateUint16(profile.polling.interval, 'Polling interval')
  if (profile.idleTime) validateUint16(profile.idleTime.seconds, 'Idle time')
  if (profile.dongleLed) validateUint8(profile.dongleLed.mode, 'Dongle LED mode')
  if (profile.dongleLedMulti) {
    for (const mode of profile.dongleLedMulti.modes) validateUint8(mode, 'Multi dongle LED mode')
  }
}

function validateDpiValue(value: number, min: number, max: number, name: string): void {
  if (value < min || value > max) throw new RazerProfileFileError(`${name} ${value} is outside ${min}-${max}`)
}

function validateUint8(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 0xff) throw new RazerProfileFileError(`${name} is invalid`)
}

function validateUint16(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 0xffff) throw new RazerProfileFileError(`${name} is invalid`)
}

function crc32(bytes: Uint8Array): number {
  let crc = UINT32_MAX
  for (const byte of bytes) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ UINT32_MAX) >>> 0
}
