import { describe, it, expect } from 'vitest'
import { REPORT_ID_SHORT, REPORT_ID_LONG, HIDPP_PAGE, CMD_ONBOARD_PROFILES, ONBOARD_PROFILE } from '../constants'
import { setBE16, setLE16, crcCcitt } from '../hidppReport'
import {
  logitechGetBatteryLevel,
  logitechGetDpi,
  logitechGetDpiInfo,
  logitechSetDpi,
  logitechGetPollingRate,
  logitechGetPollingRateInfo,
  logitechSetPollingRate,
  logitechGetActiveProfile,
  logitechSetActiveProfile,
  logitechGetProfilesDescription,
  logitechReadProfile,
  logitechGetAllProfiles
} from '../protocol'
import { createMockSession, type RecordedSend } from './mockHidDevice'

const short = (subId: number, address: number, params: number[] = []) => {
  const data = new Uint8Array(6)
  data[0] = 0x00
  data[1] = subId
  data[2] = address
  for (let i = 0; i < Math.min(params.length, 3); i++) data[3 + i] = params[i]
  return { reportId: REPORT_ID_SHORT, data }
}
const long = (subId: number, address: number, params: Uint8Array | number[]) => {
  const data = new Uint8Array(19)
  data[0] = 0x00
  data[1] = subId
  data[2] = address
  const arr = params instanceof Uint8Array ? params : Uint8Array.from(params)
  data.set(arr.subarray(0, 16), 3)
  return { reportId: REPORT_ID_LONG, data }
}

type Features = Map<number, number>
type FeatureHandler = (functionId: number, params: Uint8Array, send: RecordedSend) => ReturnType<NonNullable<ReturnType<typeof createMockSession>['hid']['responder']>>

const buildDevice = (
  features: Features,
  handlers: Partial<Record<number, FeatureHandler>>
) => {
  return (send: RecordedSend) => {
    const subId = send.data[1]
    const address = send.data[2]
    const functionId = (address >> 4) & 0x0f
    const params = send.data.slice(3)

    // root: GET_FEATURE / GET_PROTOCOL_VERSION
    if (subId === 0x00) {
      if (functionId === 0x00) {
        const featurePage = (params[0] << 8) | params[1]
        const idx = features.get(featurePage) ?? 0
        return short(subId, address, [idx, 0, 0])
      }
      if (functionId === 0x01) return short(subId, address, [2, 0, 0])
    }

    // Find which feature page this subId corresponds to and dispatch
    for (const [page, idx] of features) {
      if (idx === subId) {
        const handler = handlers[page]
        if (handler) return handler(functionId, params, send)
      }
    }
    return undefined
  }
}

describe('battery level', () => {
  it('reads from BATTERY_LEVEL_STATUS (0x1000) when available', async () => {
    const session = createMockSession()
    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.BATTERY_LEVEL_STATUS, 5]]), {
      [HIDPP_PAGE.BATTERY_LEVEL_STATUS]: (fn, _p, s) => {
        if (fn === 0x00) return short(s.data[1], s.data[2], [82, 100, 0x01])
        return undefined
      }
    })

    const info = await logitechGetBatteryLevel(session)
    expect(info.level).toBe(82)
    expect(info.nextLevel).toBe(100)
    expect(info.status).toBe(0x01)
  })

  it('falls back to UNIFIED_BATTERY (0x1004) when 0x1000 unavailable', async () => {
    const session = createMockSession()
    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.UNIFIED_BATTERY, 6]]), {
      [HIDPP_PAGE.UNIFIED_BATTERY]: (fn, _p, s) => {
        if (fn === 0x00) return short(s.data[1], s.data[2], [60, 0, 0x02])
        return undefined
      }
    })

    const info = await logitechGetBatteryLevel(session)
    expect(info.level).toBe(60)
    expect(info.status).toBe(0x02)
  })

  it('falls back to BATTERY_VOLTAGE (0x1001) and converts millivolts to %', async () => {
    const session = createMockSession()
    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.BATTERY_VOLTAGE, 7]]), {
      [HIDPP_PAGE.BATTERY_VOLTAGE]: (fn, _p, s) => {
        if (fn === 0x00) {
          // Build a long response (battery voltage feature returns long); first 2 bytes = mV BE
          const p = new Uint8Array(16)
          setBE16(p, 0, 3750)
          return long(s.data[1], s.data[2], p)
        }
        return undefined
      }
    })

    const info = await logitechGetBatteryLevel(session)
    // 3750mV -> linear 3300-4200 -> 50%
    expect(info.level).toBe(50)
  })

  it('throws when no battery feature is supported', async () => {
    const session = createMockSession()
    session.hid.responder = buildDevice(new Map(), {})
    await expect(logitechGetBatteryLevel(session)).rejects.toThrowError(/not supported/i)
  })
})

describe('DPI (0x2201)', () => {
  it('reports discrete DPI list', async () => {
    const session = createMockSession()
    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.ADJUSTABLE_DPI, 4]]), {
      [HIDPP_PAGE.ADJUSTABLE_DPI]: (fn, _p, s) => {
        if (fn === 0x00) return short(s.data[1], s.data[2], [1])
        if (fn === 0x01) {
          const params = new Uint8Array(16)
          // Build a list of 400, 800, 1600, 3200 then 0 terminator
          for (const [i, dpi] of [400, 800, 1600, 3200].entries()) setBE16(params, i * 2, dpi)
          return long(s.data[1], s.data[2], params)
        }
        return undefined
      }
    })

    const info = await logitechGetDpiInfo(session)
    expect(info.sensorCount).toBe(1)
    expect(info.dpiList).toEqual([400, 800, 1600, 3200])
    expect(info.dpiMin).toBe(400)
    expect(info.dpiMax).toBe(3200)
  })

  it('parses range-form DPI lists (0xE000 family marker)', async () => {
    const session = createMockSession()
    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.ADJUSTABLE_DPI, 4]]), {
      [HIDPP_PAGE.ADJUSTABLE_DPI]: (fn, _p, s) => {
        if (fn === 0x00) return short(s.data[1], s.data[2], [1])
        if (fn === 0x01) {
          const params = new Uint8Array(16)
          setBE16(params, 0, 0xe001)
          setBE16(params, 2, 200) // min
          setBE16(params, 4, 25600) // max
          setBE16(params, 6, 50) // step
          return long(s.data[1], s.data[2], params)
        }
        return undefined
      }
    })

    const info = await logitechGetDpiInfo(session)
    expect(info.dpiMin).toBe(200)
    expect(info.dpiMax).toBe(25600)
    expect(info.dpiStep).toBe(50)
  })

  it('logitechGetDpi reads current and default DPI', async () => {
    const session = createMockSession()
    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.ADJUSTABLE_DPI, 4]]), {
      [HIDPP_PAGE.ADJUSTABLE_DPI]: (fn, _p, s) => {
        if (fn === 0x02) {
          const params = new Uint8Array(16)
          params[0] = 0x00 // sensor index
          setBE16(params, 1, 1600)
          setBE16(params, 3, 800)
          return long(s.data[1], s.data[2], params)
        }
        return undefined
      }
    })

    const dpi = await logitechGetDpi(session)
    expect(dpi.sensorIndex).toBe(0)
    expect(dpi.dpi).toBe(1600)
    expect(dpi.defaultDpi).toBe(800)
  })

  it('logitechSetDpi sends sensor index + BE16 DPI', async () => {
    const session = createMockSession()
    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.ADJUSTABLE_DPI, 4]]), {
      [HIDPP_PAGE.ADJUSTABLE_DPI]: (fn, _p, s) => {
        if (fn === 0x03) return short(s.data[1], s.data[2], [0, 0, 0])
        return undefined
      }
    })

    await logitechSetDpi(session, 2400)
    const setSend = session.hid.sends.find((s) => (s.data[2] >> 4) === 0x03 && s.data[1] === 4)!
    expect(setSend).toBeDefined()
    // params start at offset 3 of the wire payload (deviceIdx, subId, address, p0..)
    expect(setSend.data[3]).toBe(0) // sensor
    expect(setSend.data[4]).toBe(0x09) // 2400 high
    expect(setSend.data[5]).toBe(0x60) // 2400 low
  })
})

describe('polling rate (HID++ feature 0x8060)', () => {
  it('reports supported rates from the bitmask per spec (bit N = (N+1) ms period)', async () => {
    const session = createMockSession()
    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.ADJUSTABLE_REPORT_RATE, 8]]), {
      [HIDPP_PAGE.ADJUSTABLE_REPORT_RATE]: (fn, _p, s) => {
        if (fn === 0x00) {
          // bits 0..3 set = supports 1, 2, 4, 8 ms periods = 1000, 500, 250, 125 Hz
          return short(s.data[1], s.data[2], [0x0f])
        }
        return undefined
      }
    })

    const info = await logitechGetPollingRateInfo(session)
    expect(info.supportedRates).toEqual([1000, 500, 250, 125])
  })

  it('logitechGetPollingRate returns Hz from the ms value reported by the device', async () => {
    const session = createMockSession()
    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.ADJUSTABLE_REPORT_RATE, 8]]), {
      [HIDPP_PAGE.ADJUSTABLE_REPORT_RATE]: (fn, _p, s) => {
        if (fn === 0x01) return short(s.data[1], s.data[2], [2]) // 2ms = 500Hz
        return undefined
      }
    })
    expect(await logitechGetPollingRate(session)).toBe(500)
  })

  it('logitechSetPollingRate sends the period in ms (Hz -> ms)', async () => {
    const session = createMockSession()
    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.ADJUSTABLE_REPORT_RATE, 8]]), {
      [HIDPP_PAGE.ADJUSTABLE_REPORT_RATE]: (fn, _p, s) => {
        if (fn === 0x02) return short(s.data[1], s.data[2], [0])
        return undefined
      }
    })

    await logitechSetPollingRate(session, 125)
    const sent = session.hid.sends.find((s) => (s.data[2] >> 4) === 0x02 && s.data[1] === 8)!
    expect(sent.data[3]).toBe(8) // 125Hz -> 8ms period

    await logitechSetPollingRate(session, 1000)
    const sent2 = session.hid.sends.filter((s) => (s.data[2] >> 4) === 0x02 && s.data[1] === 8)[1]!
    expect(sent2.data[3]).toBe(1) // 1000Hz -> 1ms period
  })
})

describe('onboard profiles (HID++ feature 0x8100)', () => {
  it('parses the description payload', async () => {
    const session = createMockSession()
    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.ONBOARD_PROFILES, 9]]), {
      [HIDPP_PAGE.ONBOARD_PROFILES]: (fn, _p, s) => {
        if (fn === CMD_ONBOARD_PROFILES.GET_DESCRIPTION) {
          const params = new Uint8Array(16)
          params[0] = 0x01 // memoryModel
          params[1] = 0x05 // profileFormat
          params[2] = 0x00 // macroFormat
          params[3] = 3 // profileCount
          params[4] = 1 // profileCountOOB
          params[5] = 11 // buttonCount
          params[6] = 8 // sectorCount
          setBE16(params, 7, 256) // sectorSize
          params[9] = 0x0a // mechanical layout (gshift=0b10, dpishift=0b10)
          return long(s.data[1], s.data[2], params)
        }
        return undefined
      }
    })

    const desc = await logitechGetProfilesDescription(session)
    expect(desc.profileCount).toBe(3)
    expect(desc.sectorSize).toBe(256)
    expect(desc.buttonCount).toBe(11)
    expect(desc.mechanicalLayout & 0x03).toBe(0x02)
  })

  it('reads / sets the active profile (sector address)', async () => {
    const session = createMockSession()
    let stored = 0x0101
    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.ONBOARD_PROFILES, 9]]), {
      [HIDPP_PAGE.ONBOARD_PROFILES]: (fn, p, s) => {
        if (fn === CMD_ONBOARD_PROFILES.GET_CURRENT_PROFILE) {
          const params = new Uint8Array(16)
          setBE16(params, 0, stored)
          return long(s.data[1], s.data[2], params)
        }
        if (fn === CMD_ONBOARD_PROFILES.SET_CURRENT_PROFILE) {
          stored = (p[0] << 8) | p[1]
          return short(s.data[1], s.data[2], [0])
        }
        return undefined
      }
    })

    expect(await logitechGetActiveProfile(session)).toBe(0x0101)
    await logitechSetActiveProfile(session, 0x0103)
    expect(await logitechGetActiveProfile(session)).toBe(0x0103)
  })

  it('parses a profile sector: report rate, default DPI index, DPI stages, name', async () => {
    const session = createMockSession()
    const sectorSize = 256
    const sectorData = new Uint8Array(sectorSize)
    sectorData[0] = 1 // 1ms
    sectorData[1] = 0 // default DPI idx 0
    sectorData[2] = 1 // shift DPI idx 1
    setLE16(sectorData, 3, 800)
    setLE16(sectorData, 5, 1600)
    setLE16(sectorData, 7, 3200)
    setLE16(sectorData, 9, 0xffff) // empty stage
    setLE16(sectorData, 11, 0xffff)
    const name = 'My Profile'
    for (let i = 0; i < name.length; i++) setLE16(sectorData, 160 + i * 2, name.charCodeAt(i))

    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.ONBOARD_PROFILES, 9]]), {
      [HIDPP_PAGE.ONBOARD_PROFILES]: (fn, p, s) => {
        if (fn === CMD_ONBOARD_PROFILES.MEMORY_READ) {
          const offset = (p[2] << 8) | p[3]
          const chunk = sectorData.slice(offset, offset + 16)
          const padded = new Uint8Array(16)
          padded.set(chunk)
          return long(s.data[1], s.data[2], padded)
        }
        return undefined
      }
    })

    const profile = await logitechReadProfile(session, 0x0101, sectorSize)
    expect(profile.reportRateMs).toBe(1)
    expect(profile.defaultDpiIndex).toBe(0)
    expect(profile.dpiShiftIndex).toBe(1)
    expect(profile.dpiStages).toEqual([800, 1600, 3200])
    expect(profile.name).toBe('My Profile')
  })

  it('logitechGetAllProfiles pages through directories with >4 profiles (no 16-byte truncation)', async () => {
    const session = createMockSession()
    const sectorSize = 256

    // Directory contains 6 enabled profiles (24 bytes) + 0xFFFF terminator
    const directory = new Uint8Array(sectorSize)
    const profileSectors = [0x0101, 0x0102, 0x0103, 0x0104, 0x0105, 0x0106]
    profileSectors.forEach((sec, i) => {
      setBE16(directory, i * 4, sec)
      directory[i * 4 + 2] = 0x01 // enabled
    })
    setBE16(directory, profileSectors.length * 4, 0xffff)

    const profileSector = (idx: number) => {
      const data = new Uint8Array(sectorSize)
      data[0] = 1
      data[1] = 0
      data[2] = 0
      setLE16(data, 3, 400 + idx * 100)
      const name = `Profile ${idx + 1}`
      for (let i = 0; i < name.length; i++) setLE16(data, 160 + i * 2, name.charCodeAt(i))
      return data
    }
    const sectors = new Map<number, Uint8Array>([
      [0x0000, directory],
      ...profileSectors.map((s, i) => [s, profileSector(i)] as [number, Uint8Array])
    ])

    session.hid.responder = buildDevice(new Map([[HIDPP_PAGE.ONBOARD_PROFILES, 9]]), {
      [HIDPP_PAGE.ONBOARD_PROFILES]: (fn, p, s) => {
        if (fn === CMD_ONBOARD_PROFILES.GET_DESCRIPTION) {
          const params = new Uint8Array(16)
          params[3] = profileSectors.length
          params[4] = 0
          params[5] = 11
          params[6] = 8
          setBE16(params, 7, sectorSize)
          return long(s.data[1], s.data[2], params)
        }
        if (fn === CMD_ONBOARD_PROFILES.GET_CURRENT_PROFILE) {
          const params = new Uint8Array(16)
          setBE16(params, 0, 0x0103)
          return long(s.data[1], s.data[2], params)
        }
        if (fn === CMD_ONBOARD_PROFILES.MEMORY_READ) {
          const sector = (p[0] << 8) | p[1]
          const offset = (p[2] << 8) | p[3]
          const buf = sectors.get(sector)
          if (!buf) return short(s.data[1], s.data[2], [0])
          const chunk = new Uint8Array(16)
          chunk.set(buf.slice(offset, offset + 16))
          return long(s.data[1], s.data[2], chunk)
        }
        return undefined
      }
    })

    const result = await logitechGetAllProfiles(session)
    expect(result.profiles.map((p) => p.sector)).toEqual(profileSectors)
    expect(result.activeProfileIndex).toBe(2)
    expect(result.profiles[0].name).toBe('Profile 1')
    expect(result.profiles[5].name).toBe('Profile 6')
  })
})

describe('crc + onboard constants invariants', () => {
  it('ONBOARD_PROFILE.MAX_DPI_STAGES is 5 and matches the parser assumption', () => {
    expect(ONBOARD_PROFILE.MAX_DPI_STAGES).toBe(5)
  })

  it('crcCcitt is deterministic and a CRC change is detectable', () => {
    const data = new Uint8Array(256)
    for (let i = 0; i < 256; i++) data[i] = i
    const c1 = crcCcitt(data, 254)
    data[10] ^= 0xff
    const c2 = crcCcitt(data, 254)
    expect(c1).not.toBe(c2)
  })
})
