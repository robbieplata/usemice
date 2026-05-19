import { describe, it, expect } from 'vitest'
import { HidppFeatures, getFeatures } from '../features'
import { REPORT_ID_SHORT, REPORT_ID_LONG, ERROR_MSG, HIDPP20_ERROR, HIDPP10_ERROR, HIDPP_PAGE } from '../constants'
import { createMockSession, type RecordedSend } from './mockHidDevice'

/** Build a short-report response payload (sans report-id). */
const short = (subId: number, address: number, params: number[] = []): { reportId: number; data: Uint8Array } => {
  const data = new Uint8Array(6)
  data[0] = 0x00 // deviceIdx (wired)
  data[1] = subId
  data[2] = address
  for (let i = 0; i < Math.min(params.length, 3); i++) data[3 + i] = params[i]
  return { reportId: REPORT_ID_SHORT, data }
}

const long = (subId: number, address: number, params: number[]): { reportId: number; data: Uint8Array } => {
  const data = new Uint8Array(19)
  data[0] = 0x00
  data[1] = subId
  data[2] = address
  for (let i = 0; i < Math.min(params.length, 16); i++) data[3 + i] = params[i]
  return { reportId: REPORT_ID_LONG, data }
}

const errorResponse = (
  origSubId: number,
  origAddress: number,
  errorCode: number
): { reportId: number; data: Uint8Array } => {
  const data = new Uint8Array(6)
  data[0] = 0x00
  data[1] = ERROR_MSG
  data[2] = origSubId
  data[3] = origAddress
  data[4] = errorCode
  return { reportId: REPORT_ID_SHORT, data }
}

type SimulatedFeature = { index: number; type?: number; version?: number }

const buildSimulator = (
  features: Map<number, SimulatedFeature>,
  custom?: (send: RecordedSend) => ReturnType<NonNullable<ReturnType<typeof createMockSession>['hid']['responder']>>
) => {
  return (send: RecordedSend) => {
    const subId = send.data[1]
    const address = send.data[2]
    const functionId = (address >> 4) & 0x0f
    const params = send.data.slice(3)

    // Root (feature index 0): GET_FEATURE (0x00), GET_PROTOCOL_VERSION (0x01)
    if (subId === 0x00) {
      if (functionId === 0x00) {
        const featurePage = (params[0] << 8) | params[1]
        const feat = features.get(featurePage)
        if (!feat) return short(subId, address, [0, 0, 0])
        return short(subId, address, [feat.index, feat.type ?? 0, feat.version ?? 0])
      }
      if (functionId === 0x01) {
        return short(subId, address, [2, 0, 0]) // HID++ 2.0
      }
    }

    // Feature set (index for 0x0001)
    const featureSet = features.get(HIDPP_PAGE.FEATURE_SET)
    if (featureSet && subId === featureSet.index) {
      if (functionId === 0x00) {
        const total = [...features.values()].reduce((n, f) => Math.max(n, f.index), 0)
        return short(subId, address, [total])
      }
      if (functionId === 0x01) {
        const wantIndex = params[0]
        const found = [...features.entries()].find(([, f]) => f.index === wantIndex)
        if (!found) return short(subId, address, [0, 0, 0])
        const [page, f] = found
        return short(subId, address, [(page >> 8) & 0xff, page & 0xff, f.type ?? 0])
      }
    }

    if (custom) return custom(send)
    return undefined
  }
}

describe('HidppFeatures', () => {
  it('returns 0 for the root feature page without any I/O', async () => {
    const session = createMockSession()
    const features = new HidppFeatures(session)
    expect(await features.getFeatureIndex(HIDPP_PAGE.ROOT)).toBe(0)
    expect(session.hid.sends).toHaveLength(0)
  })

  it('queries the device, caches the result, and reuses the cache on subsequent calls', async () => {
    const session = createMockSession()
    const sim = new Map<number, SimulatedFeature>([
      [HIDPP_PAGE.FEATURE_SET, { index: 1 }],
      [HIDPP_PAGE.ADJUSTABLE_DPI, { index: 5, type: 0 }]
    ])
    session.hid.responder = buildSimulator(sim)

    const features = new HidppFeatures(session)
    expect(await features.getFeatureIndex(HIDPP_PAGE.ADJUSTABLE_DPI)).toBe(5)
    const callsAfterFirst = session.hid.sends.length
    expect(await features.getFeatureIndex(HIDPP_PAGE.ADJUSTABLE_DPI)).toBe(5)
    expect(session.hid.sends.length).toBe(callsAfterFirst) // no new I/O
  })

  it('returns 0 and caches when the feature page is unknown', async () => {
    const session = createMockSession()
    session.hid.responder = buildSimulator(new Map())

    const features = new HidppFeatures(session)
    expect(await features.hasFeature(0xabcd)).toBe(false)
    expect(await features.hasFeature(0xabcd)).toBe(false)
    expect(session.hid.sends).toHaveLength(1)
  })

  it('detects HID++ 1.0 when GET_PROTOCOL_VERSION returns INVALID_SUBID', async () => {
    const session = createMockSession()
    session.hid.responder = (send) => {
      const subId = send.data[1]
      const address = send.data[2]
      const functionId = (address >> 4) & 0x0f
      if (subId === 0x00 && functionId === 0x01) {
        return errorResponse(subId, address, HIDPP10_ERROR.INVALID_SUBID)
      }
      return undefined
    }

    const features = new HidppFeatures(session)
    const version = await features.getProtocolVersion()
    expect(version).toEqual({ major: 1, minor: 0 })
    expect(await features.isHidpp20()).toBe(false)
  })

  it('returns major>=2 on a healthy GET_PROTOCOL_VERSION', async () => {
    const session = createMockSession()
    session.hid.responder = buildSimulator(new Map())
    const features = new HidppFeatures(session)
    const version = await features.getProtocolVersion()
    expect(version.major).toBe(2)
    expect(await features.isHidpp20()).toBe(true)
  })

  it('caches a HidppNotSupportedError as feature index 0', async () => {
    const session = createMockSession()
    session.hid.responder = (send) => {
      const subId = send.data[1]
      const address = send.data[2]
      return errorResponse(subId, address, HIDPP20_ERROR.UNSUPPORTED)
    }
    const features = new HidppFeatures(session)
    expect(await features.getFeatureIndex(HIDPP_PAGE.ADJUSTABLE_DPI)).toBe(0)
    expect(await features.hasFeature(HIDPP_PAGE.ADJUSTABLE_DPI)).toBe(false)
    expect(session.hid.sends).toHaveLength(1) // cached
  })

  it('getAllFeatures iterates the feature set and populates the feature list', async () => {
    const session = createMockSession()
    const sim = new Map<number, SimulatedFeature>([
      [HIDPP_PAGE.FEATURE_SET, { index: 1 }],
      [HIDPP_PAGE.ADJUSTABLE_DPI, { index: 5, type: 0 }],
      [HIDPP_PAGE.ADJUSTABLE_REPORT_RATE, { index: 6, type: 0 }]
    ])
    session.hid.responder = buildSimulator(sim)

    const features = new HidppFeatures(session)
    const list = await features.getAllFeatures()
    const pages = list.map((f) => f.featurePage)
    expect(pages).toContain(HIDPP_PAGE.ADJUSTABLE_DPI)
    expect(pages).toContain(HIDPP_PAGE.ADJUSTABLE_REPORT_RATE)
  })

  it('featureRequest sends with the correct featureIndex and uses the long variant when requested', async () => {
    const session = createMockSession()
    const sim = new Map<number, SimulatedFeature>([
      [HIDPP_PAGE.FEATURE_SET, { index: 1 }],
      [HIDPP_PAGE.ONBOARD_PROFILES, { index: 9 }]
    ])
    session.hid.responder = buildSimulator(sim, (send) => {
      const subId = send.data[1]
      const address = send.data[2]
      // Echo a long response to long requests so the test can observe the size
      if (send.reportId === REPORT_ID_LONG) {
        return long(subId, address, [0xde, 0xad, 0xbe, 0xef])
      }
      return short(subId, address, [0x11])
    })

    const features = new HidppFeatures(session)

    const shortResp = await features.featureRequest(HIDPP_PAGE.ONBOARD_PROFILES, 0x00)
    expect(shortResp.reportType).toBe('short')
    expect(shortResp.subId).toBe(9)

    const longResp = await features.featureRequestLong(HIDPP_PAGE.ONBOARD_PROFILES, 0x05)
    expect(longResp.reportType).toBe('long')
    expect(longResp.getParameter(0)).toBe(0xde)
  })

  it('throws HidppNotSupportedError when calling featureRequest on an unsupported page', async () => {
    const session = createMockSession()
    session.hid.responder = buildSimulator(new Map())
    const features = new HidppFeatures(session)
    await expect(features.featureRequest(0xabcd, 0x00)).rejects.toThrowError(/0xabcd/i)
  })

  it('clearCache wipes the feature index map and lets us re-discover', async () => {
    const session = createMockSession()
    session.hid.responder = buildSimulator(
      new Map([
        [HIDPP_PAGE.FEATURE_SET, { index: 1 }],
        [HIDPP_PAGE.ADJUSTABLE_DPI, { index: 5 }]
      ])
    )

    const features = new HidppFeatures(session)
    await features.getFeatureIndex(HIDPP_PAGE.ADJUSTABLE_DPI)
    const before = session.hid.sends.length
    features.clearCache()
    await features.getFeatureIndex(HIDPP_PAGE.ADJUSTABLE_DPI)
    expect(session.hid.sends.length).toBeGreaterThan(before)
  })

  it('getFeatures returns a singleton per session', () => {
    const session = createMockSession()
    const a = getFeatures(session)
    const b = getFeatures(session)
    expect(a).toBe(b)
  })
})
