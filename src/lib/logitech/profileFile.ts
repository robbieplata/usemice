const MAGIC = [0x55, 0x4d, 0x50, 0x46] as const // UMPF
const VERSION = 1
const CHECKSUM_SIZE = 4
const REPORT_RATE_SCALE = 1000
const UINT16_MAX = 0xffff
const UINT32_MAX = 0xffffffff

export type LogitechProfileFileProfile = {
  name: string
  reportRateMs: number
  dpiStages: number[]
  activeDpiIndex: number
  dpiShiftIndex: number
}

export type LogitechProfileFileData = {
  activeProfileIndex: number
  profiles: LogitechProfileFileProfile[]
}

export type LogitechProfileFileValidation = {
  profileCount: number
  dpiMin: number
  dpiMax: number
  dpiStep: number
  maxDpiStages: number
  hasDpiShift: boolean
}

export class LogitechProfileFileError extends Error {
  override readonly name = 'LogitechProfileFileError'
}

class BinaryWriter {
  private readonly bytes: number[] = []

  writeUint8(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > 0xff) throw new LogitechProfileFileError('Invalid uint8 value')
    this.bytes.push(value)
  }

  writeUint16(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > UINT16_MAX) {
      throw new LogitechProfileFileError('Invalid uint16 value')
    }
    this.bytes.push(value & 0xff, (value >> 8) & 0xff)
  }

  writeUint32(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > UINT32_MAX) {
      throw new LogitechProfileFileError('Invalid uint32 value')
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
    if (this.offset + length > this.bytes.length) {
      throw new LogitechProfileFileError('Profile file is truncated')
    }
  }
}

export function encodeLogitechProfileFile(data: LogitechProfileFileData): Uint8Array {
  validateSerializableData(data)

  const writer = new BinaryWriter()
  writer.writeBytes(new Uint8Array(MAGIC))
  writer.writeUint8(VERSION)
  writer.writeUint8(data.profiles.length)
  writer.writeUint8(data.activeProfileIndex)
  writer.writeUint8(0)

  const encoder = new TextEncoder()
  for (const profile of data.profiles) {
    const name = encoder.encode(profile.name)
    if (name.length > UINT16_MAX) throw new LogitechProfileFileError('Profile name is too long')

    writer.writeUint16(name.length)
    writer.writeBytes(name)
    writer.writeUint32(Math.round(profile.reportRateMs * REPORT_RATE_SCALE))
    writer.writeUint8(profile.activeDpiIndex)
    writer.writeUint8(profile.dpiShiftIndex)
    writer.writeUint8(profile.dpiStages.length)
    for (const dpi of profile.dpiStages) writer.writeUint16(dpi)
  }

  const body = writer.toBytes()
  const out = new Uint8Array(body.length + CHECKSUM_SIZE)
  out.set(body)
  new DataView(out.buffer).setUint32(body.length, crc32(body), true)
  return out
}

export function decodeLogitechProfileFile(bytes: Uint8Array): LogitechProfileFileData {
  if (bytes.length < MAGIC.length + 4 + CHECKSUM_SIZE) {
    throw new LogitechProfileFileError('Profile file is too short')
  }

  const body = bytes.slice(0, -CHECKSUM_SIZE)
  const expectedChecksum = new DataView(bytes.buffer, bytes.byteOffset + body.length, CHECKSUM_SIZE).getUint32(0, true)
  const actualChecksum = crc32(body)
  if (actualChecksum !== expectedChecksum) {
    throw new LogitechProfileFileError('Profile file checksum is invalid')
  }

  const reader = new BinaryReader(body)
  for (const byte of MAGIC) {
    if (reader.readUint8() !== byte) throw new LogitechProfileFileError('Profile file type is not supported')
  }

  const version = reader.readUint8()
  if (version !== VERSION) throw new LogitechProfileFileError(`Unsupported profile file version: ${version}`)

  const profileCount = reader.readUint8()
  const activeProfileIndex = reader.readUint8()
  reader.readUint8() // reserved

  const decoder = new TextDecoder('utf-8', { fatal: true })
  const profiles: LogitechProfileFileProfile[] = []
  for (let i = 0; i < profileCount; i++) {
    const nameLength = reader.readUint16()
    const name = decoder.decode(reader.readBytes(nameLength))
    const reportRateMs = reader.readUint32() / REPORT_RATE_SCALE
    const activeDpiIndex = reader.readUint8()
    const dpiShiftIndex = reader.readUint8()
    const dpiStageCount = reader.readUint8()
    const dpiStages: number[] = []
    for (let j = 0; j < dpiStageCount; j++) dpiStages.push(reader.readUint16())

    profiles.push({ name, reportRateMs, dpiStages, activeDpiIndex, dpiShiftIndex })
  }

  if (!reader.done) throw new LogitechProfileFileError('Profile file contains unexpected trailing data')

  const data = { activeProfileIndex, profiles }
  validateSerializableData(data)
  return data
}

export function validateLogitechProfileFile(
  data: LogitechProfileFileData,
  validation: LogitechProfileFileValidation,
): void {
  if (data.profiles.length !== validation.profileCount) {
    throw new LogitechProfileFileError(
      `Profile count mismatch: file has ${data.profiles.length}, device has ${validation.profileCount}`,
    )
  }
  if (data.activeProfileIndex < 0 || data.activeProfileIndex >= data.profiles.length) {
    throw new LogitechProfileFileError('Active profile index is out of range')
  }

  data.profiles.forEach((profile, profileIndex) => {
    if (profile.dpiStages.length < 1) {
      throw new LogitechProfileFileError(`Profile ${profileIndex + 1} must include at least one DPI stage`)
    }
    if (profile.dpiStages.length > validation.maxDpiStages) {
      throw new LogitechProfileFileError(
        `Profile ${profileIndex + 1} has too many DPI stages; maximum is ${validation.maxDpiStages}`,
      )
    }
    if (profile.activeDpiIndex < 0 || profile.activeDpiIndex >= profile.dpiStages.length) {
      throw new LogitechProfileFileError(`Profile ${profileIndex + 1} active DPI stage is out of range`)
    }
    if (validation.hasDpiShift && (profile.dpiShiftIndex < 0 || profile.dpiShiftIndex >= profile.dpiStages.length)) {
      throw new LogitechProfileFileError(`Profile ${profileIndex + 1} DPI-shift stage is out of range`)
    }
    if (!validation.hasDpiShift && profile.dpiShiftIndex !== 0) {
      throw new LogitechProfileFileError(`Profile ${profileIndex + 1} uses DPI shift, but this device does not`)
    }
    if (profile.reportRateMs <= 0 || !Number.isFinite(profile.reportRateMs)) {
      throw new LogitechProfileFileError(`Profile ${profileIndex + 1} polling rate is invalid`)
    }

    for (const dpi of profile.dpiStages) {
      if (dpi < validation.dpiMin || dpi > validation.dpiMax) {
        throw new LogitechProfileFileError(
          `Profile ${profileIndex + 1} DPI ${dpi} is outside ${validation.dpiMin}-${validation.dpiMax}`,
        )
      }
      if (validation.dpiStep > 0 && (dpi - validation.dpiMin) % validation.dpiStep !== 0) {
        throw new LogitechProfileFileError(
          `Profile ${profileIndex + 1} DPI ${dpi} does not match the device step ${validation.dpiStep}`,
        )
      }
    }
  })
}

function validateSerializableData(data: LogitechProfileFileData): void {
  if (data.profiles.length < 1 || data.profiles.length > 0xff) {
    throw new LogitechProfileFileError('Profile count is out of range')
  }
  if (
    !Number.isInteger(data.activeProfileIndex) || data.activeProfileIndex < 0 ||
    data.activeProfileIndex >= data.profiles.length
  ) {
    throw new LogitechProfileFileError('Active profile index is out of range')
  }

  data.profiles.forEach((profile, index) => {
    if (!Number.isFinite(profile.reportRateMs) || profile.reportRateMs <= 0) {
      throw new LogitechProfileFileError(`Profile ${index + 1} polling rate is invalid`)
    }
    if (!Number.isInteger(profile.activeDpiIndex) || profile.activeDpiIndex < 0 || profile.activeDpiIndex > 0xff) {
      throw new LogitechProfileFileError(`Profile ${index + 1} active DPI stage is out of range`)
    }
    if (!Number.isInteger(profile.dpiShiftIndex) || profile.dpiShiftIndex < 0 || profile.dpiShiftIndex > 0xff) {
      throw new LogitechProfileFileError(`Profile ${index + 1} DPI-shift stage is out of range`)
    }
    if (profile.dpiStages.length < 1 || profile.dpiStages.length > 0xff) {
      throw new LogitechProfileFileError(`Profile ${index + 1} DPI stage count is out of range`)
    }
    for (const dpi of profile.dpiStages) {
      if (!Number.isInteger(dpi) || dpi < 0 || dpi > UINT16_MAX) {
        throw new LogitechProfileFileError(`Profile ${index + 1} has an invalid DPI value`)
      }
    }
  })
}

function crc32(bytes: Uint8Array): number {
  let crc = UINT32_MAX
  for (const byte of bytes) {
    crc ^= byte
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ UINT32_MAX) >>> 0
}
