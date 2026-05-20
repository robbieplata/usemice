import { describe, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import {
  crcCcitt,
  getBE16,
  getLE16,
  hidpp20Request,
  hidpp20RequestLong,
  HidppError,
  HidppNotSupportedError,
  HidppReport,
  HidppTimeoutError,
  setBE16,
  setLE16,
} from '../hidppReport.ts'
import {
  ERROR_MSG,
  HIDPP10_ERROR,
  HIDPP20_ERROR,
  LONG_MESSAGE_LENGTH,
  REPORT_ID_LONG,
  REPORT_ID_SHORT,
  SHORT_MESSAGE_LENGTH,
} from '../constants.ts'
import { createMockSession } from './mockHidDevice.ts'

describe('byte helpers', () => {
  it('reads/writes BE16', () => {
    const buf = new Uint8Array(4)
    setBE16(buf, 0, 0x1234)
    setBE16(buf, 2, 0xabcd)
    expect(Array.from(buf)).toEqual([0x12, 0x34, 0xab, 0xcd])
    expect(getBE16(buf, 0)).toBe(0x1234)
    expect(getBE16(buf, 2)).toBe(0xabcd)
  })

  it('reads/writes LE16', () => {
    const buf = new Uint8Array(4)
    setLE16(buf, 0, 0x1234)
    setLE16(buf, 2, 0xabcd)
    expect(Array.from(buf)).toEqual([0x34, 0x12, 0xcd, 0xab])
    expect(getLE16(buf, 0)).toBe(0x1234)
    expect(getLE16(buf, 2)).toBe(0xabcd)
  })
})

describe('crcCcitt', () => {
  it('matches a known CRC-16/CCITT-FALSE value', () => {
    // crc("123456789") = 0x29B1
    const data = new TextEncoder().encode('123456789')
    expect(crcCcitt(data)).toBe(0x29b1)
  })

  it('honours the optional length argument', () => {
    const data = new Uint8Array([0x01, 0x02, 0x03, 0xff, 0xff])
    expect(crcCcitt(data, 3)).toBe(crcCcitt(new Uint8Array([0x01, 0x02, 0x03])))
  })
})

describe('HidppReport encoding', () => {
  it('short() produces a 7-byte report with REPORT_ID_SHORT at byte 0', () => {
    const r = HidppReport.short({ subId: 0x05, address: 0x10 })
    expect(r.reportType).toBe('short')
    expect(r.length).toBe(SHORT_MESSAGE_LENGTH)
    expect(r.reportId).toBe(REPORT_ID_SHORT)
    expect(r.toBytes[0]).toBe(REPORT_ID_SHORT)
  })

  it('long() produces a 20-byte report with REPORT_ID_LONG at byte 0', () => {
    const r = HidppReport.long({ subId: 0x05, address: 0x20 })
    expect(r.reportType).toBe('long')
    expect(r.length).toBe(LONG_MESSAGE_LENGTH)
    expect(r.reportId).toBe(REPORT_ID_LONG)
    expect(r.toBytes[0]).toBe(REPORT_ID_LONG)
  })

  it('places deviceIdx, subId, address, and parameters at the right offsets', () => {
    const r = HidppReport.short({
      deviceIdx: 0xff,
      subId: 0x07,
      address: 0x4f,
      parameters: new Uint8Array([0xaa, 0xbb, 0xcc]),
    })
    const bytes = r.toBytes
    expect(bytes[1]).toBe(0xff)
    expect(bytes[2]).toBe(0x07)
    expect(bytes[3]).toBe(0x4f)
    expect(bytes[4]).toBe(0xaa)
    expect(bytes[5]).toBe(0xbb)
    expect(bytes[6]).toBe(0xcc)
  })

  it('hidpp20Request encodes function_id into the upper nibble of address with a non-zero software_id', () => {
    const r = hidpp20Request(0x05, 0x02, new Uint8Array([0x42]))
    expect(r.reportType).toBe('short')
    expect(r.subId).toBe(0x05)
    // address = (functionId << 4) | software_id  --  software_id MUST be non-zero (reserved=0)
    expect((r.address >> 4) & 0x0f).toBe(0x02)
    expect(r.address & 0x0f).not.toBe(0x00)
  })

  it('hidpp20RequestLong returns a long report', () => {
    const r = hidpp20RequestLong(0x10, 0x01)
    expect(r.reportType).toBe('long')
    expect(r.length).toBe(LONG_MESSAGE_LENGTH)
  })

  it('getParameter / getParameterBE16 read the parameter region', () => {
    const r = HidppReport.short({
      subId: 0x00,
      address: 0x00,
      parameters: new Uint8Array([0x12, 0x34, 0x56]),
    })
    expect(r.getParameter(0)).toBe(0x12)
    expect(r.getParameterBE16(0)).toBe(0x1234)
    expect(r.getParameter(2)).toBe(0x56)
  })

  it('fromBytes reconstructs a report from a wire buffer (with report-id at byte 0)', () => {
    const wire = new Uint8Array([
      REPORT_ID_LONG,
      0x01,
      0x07,
      0x4f,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
    ])
    const r = HidppReport.fromBytes(wire)
    expect(r.reportType).toBe('long')
    expect(r.deviceIdx).toBe(0x01)
    expect(r.subId).toBe(0x07)
    expect(r.address).toBe(0x4f)
    expect(Array.from(r.parameters.slice(0, 4))).toEqual([1, 2, 3, 4])
  })

  it('detects error frames and decodes HID++ 2.0 error codes', () => {
    const wire = new Uint8Array([REPORT_ID_SHORT, 0xff, ERROR_MSG, 0x07, 0x20, HIDPP20_ERROR.INVALID_FUNCTION_ID, 0])
    const r = HidppReport.fromBytes(wire)
    expect(r.isError()).toBe(true)
    expect(r.getErrorCode()).toBe(HIDPP20_ERROR.INVALID_FUNCTION_ID)
    expect(r.getErrorMessage()).toMatch(/Invalid function/i)
  })
})

describe('HidppReport.send() over the WebHID transport', () => {
  it('sends as an interrupt OUTPUT report (not a feature report)', async () => {
    const session = createMockSession()
    session.hid.responder = (send) => ({
      reportId: send.reportId,
      // build a valid response: deviceIdx, subId, address, p0..p2
      data: new Uint8Array([0x00, send.data[1], /*subId in payload (without report id)*/ 0, 0, 0, 0]),
    })

    const req = hidpp20Request(0x05, 0x00)
    // override responder to produce a matching response
    session.hid.responder = (send) => {
      // payload-without-report-id: [deviceIdx, subId, address, p0, p1, p2]
      const subId = send.data[1]
      const address = send.data[2]
      return {
        reportId: send.reportId,
        data: new Uint8Array([0x00, subId, address, 0xa1, 0xb2, 0xc3]),
      }
    }

    const response = await req.send(session)
    expect(response.getParameter(0)).toBe(0xa1)
    expect(response.getParameter(1)).toBe(0xb2)
    expect(response.getParameter(2)).toBe(0xc3)

    expect(session.hid.sends).toHaveLength(1)
    expect(session.hid.sends[0].via).toBe('output')
  })

  it('does NOT include the report-ID byte in the WebHID payload', async () => {
    const session = createMockSession()
    session.hid.responder = (send) => ({
      reportId: send.reportId,
      data: new Uint8Array([0x00, send.data[1], send.data[2], 0, 0, 0]),
    })

    const req = hidpp20Request(0x05, 0x03, new Uint8Array([0xde, 0xad, 0xbe]))
    await req.send(session)

    const sent = session.hid.sends[0]
    expect(sent.via).toBe('output')
    expect(sent.reportId).toBe(REPORT_ID_SHORT)
    // payload length for a short report (sans report-id) is SHORT_MESSAGE_LENGTH - 1 = 6
    expect(sent.data.length).toBe(SHORT_MESSAGE_LENGTH - 1)
    expect(sent.data[0]).toBe(0x00) // deviceIdx (wired)
    expect(sent.data[1]).toBe(0x05) // subId / feature index
    // address = (functionId << 4) | software_id
    expect((sent.data[2] >> 4) & 0x0f).toBe(0x03)
    // first byte must be deviceIdx, NOT a duplicated report-id
    expect(sent.data[0]).not.toBe(REPORT_ID_SHORT)
  })

  it('accepts a long (0x11) response to a short (0x10) request', async () => {
    const session = createMockSession()
    session.hid.responder = (send) => {
      const subId = send.data[1]
      const address = send.data[2]
      const long = new Uint8Array(LONG_MESSAGE_LENGTH - 1)
      long[0] = 0x00
      long[1] = subId
      long[2] = address
      for (let i = 0; i < 16; i++) long[3 + i] = i + 1
      return { reportId: REPORT_ID_LONG, data: long }
    }

    const req = hidpp20Request(0x09, 0x05)
    const response = await req.send(session)
    expect(response.reportType).toBe('long')
    expect(response.getParameter(15)).toBe(16)
  })

  it('throws HidppNotSupportedError on HID++ 2.0 UNSUPPORTED error', async () => {
    const session = createMockSession()
    session.hid.responder = (send) => {
      const subId = send.data[1]
      const address = send.data[2]
      return {
        reportId: send.reportId,
        data: new Uint8Array([0x00, ERROR_MSG, subId, address, HIDPP20_ERROR.UNSUPPORTED, 0]),
      }
    }

    const req = hidpp20Request(0x07, 0x00)
    await expect(req.send(session)).rejects.toBeInstanceOf(HidppNotSupportedError)
  })

  it('throws HidppError with INVALID_SUBID for HID++ 1.0 responses', async () => {
    const session = createMockSession()
    session.hid.responder = (send) => {
      const subId = send.data[1]
      const address = send.data[2]
      return {
        reportId: send.reportId,
        data: new Uint8Array([0x00, ERROR_MSG, subId, address, HIDPP10_ERROR.INVALID_SUBID, 0]),
      }
    }

    const req = hidpp20Request(0x00, 0x01) // ROOT.GET_PROTOCOL_VERSION
    await expect(req.send(session)).rejects.toMatchObject({
      errorCode: HIDPP10_ERROR.INVALID_SUBID,
    })
  })

  it('times out (HidppTimeoutError) when no response arrives', async () => {
    const session = createMockSession()
    // No responder, no queued input report
    const req = hidpp20Request(0x05, 0x00)
    await expect(req.send(session, 1)).rejects.toBeInstanceOf(HidppTimeoutError)
  })

  it('ignores unrelated input reports and matches the right response by subId+address', async () => {
    const session = createMockSession()
    session.hid.responder = (send) => {
      const subId = send.data[1]
      const address = send.data[2]
      return [
        // unrelated frame (different subId) — must be ignored
        { reportId: REPORT_ID_SHORT, data: new Uint8Array([0x00, 0xee, 0xee, 0, 0, 0]) },
        // notification frame with software_id=0 (lower nibble of address) — must be ignored
        { reportId: REPORT_ID_SHORT, data: new Uint8Array([0x00, subId, address & 0xf0, 0x77, 0, 0]) },
        // the real response
        { reportId: REPORT_ID_SHORT, data: new Uint8Array([0x00, subId, address, 0x99, 0, 0]) },
      ]
    }

    const req = hidpp20Request(0x05, 0x00)
    const resp = await req.send(session, 5)
    expect(resp.getParameter(0)).toBe(0x99)
  })
})

describe('HidppError subclasses', () => {
  it('HidppError carries errorCode', () => {
    const e = new HidppError('boom', 0x42)
    expect(e.errorCode).toBe(0x42)
    expect(e.name).toBe('HidppError')
  })

  it('HidppNotSupportedError mentions the feature page', () => {
    const e = new HidppNotSupportedError(0x1234)
    expect(e.message).toMatch(/0x1234/)
    expect(e.name).toBe('HidppNotSupportedError')
  })

  it('HidppTimeoutError has the expected name', () => {
    const e = new HidppTimeoutError()
    expect(e.name).toBe('HidppTimeoutError')
  })
})
