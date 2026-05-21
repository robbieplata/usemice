import { describe, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import {
  decodeLogitechProfileFile,
  encodeLogitechProfileFile,
  type LogitechProfileFileData,
  LogitechProfileFileError,
  validateLogitechProfileFile,
} from '../profileFile.ts'

const fileData = (): LogitechProfileFileData => ({
  activeProfileIndex: 1,
  profiles: [
    {
      name: 'Main',
      reportRateMs: 1,
      dpiStages: [400, 800, 1600],
      activeDpiIndex: 1,
      dpiShiftIndex: 2,
    },
    {
      name: 'Fast',
      reportRateMs: 0.5,
      dpiStages: [800, 1600, 3200],
      activeDpiIndex: 0,
      dpiShiftIndex: 1,
    },
  ],
})

const validation = {
  profileCount: 2,
  dpiMin: 400,
  dpiMax: 3200,
  dpiStep: 50,
  maxDpiStages: 5,
  hasDpiShift: true,
}

describe('Logitech profile binary file', () => {
  it('round trips profile data without JSON', () => {
    const encoded = encodeLogitechProfileFile(fileData())
    expect(new TextDecoder().decode(encoded.slice(0, 4))).toBe('UMPF')

    const decoded = decodeLogitechProfileFile(encoded)
    expect(decoded).toEqual(fileData())
  })

  it('rejects a corrupted checksum', () => {
    const encoded = encodeLogitechProfileFile(fileData())
    encoded[encoded.length - 1] ^= 0xff

    expect(() => decodeLogitechProfileFile(encoded)).toThrow(LogitechProfileFileError)
  })

  it('rejects unsupported magic', () => {
    const encoded = encodeLogitechProfileFile(fileData())
    encoded[0] = 0x00
    writeChecksum(encoded)

    expect(() => decodeLogitechProfileFile(encoded)).toThrow(LogitechProfileFileError)
  })

  it('validates profile count against the connected device', () => {
    expect(() =>
      validateLogitechProfileFile(fileData(), {
        ...validation,
        profileCount: 1,
      })
    ).toThrow(LogitechProfileFileError)
  })

  it('validates DPI bounds and step against the connected device', () => {
    const data = fileData()
    data.profiles[0].dpiStages[0] = 425

    expect(() => validateLogitechProfileFile(data, validation)).toThrow(LogitechProfileFileError)
  })

  it('validates DPI-shift support against the connected device', () => {
    expect(() =>
      validateLogitechProfileFile(fileData(), {
        ...validation,
        hasDpiShift: false,
      })
    ).toThrow(LogitechProfileFileError)
  })
})

function writeChecksum(bytes: Uint8Array): void {
  const body = bytes.slice(0, -4)
  new DataView(bytes.buffer).setUint32(bytes.length - 4, crc32(body), true)
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (const byte of bytes) {
    crc ^= byte
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}
