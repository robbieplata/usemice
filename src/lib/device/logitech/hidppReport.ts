import { type HidSession, sendOutputReport } from '../hid.ts'
import {
  ERROR_MSG,
  HIDPP10_ERROR,
  HIDPP20_ERROR,
  HIDPP_MAX_RETRIES,
  HIDPP_SOFTWARE_ID,
  HIDPP_TIMEOUT_MS,
  HIDPP_WAIT_MS,
  HIDPP_WIRED_DEVICE_IDX,
  LOGITECH_WIRELESS_RECEIVERS,
  LONG_MESSAGE_LENGTH,
  REPORT_ID_LONG,
  REPORT_ID_SHORT,
  SHORT_MESSAGE_LENGTH,
} from './constants.ts'

export class HidppError extends Error {
  readonly errorCode: number

  constructor(message: string, errorCode: number = 0) {
    super(message)
    this.name = 'HidppError'
    this.errorCode = errorCode
  }
}

export class HidppTimeoutError extends HidppError {
  constructor() {
    super('HID++ request timed out')
    this.name = 'HidppTimeoutError'
  }
}

export class HidppNotSupportedError extends HidppError {
  constructor(feature?: number) {
    super(feature !== undefined ? `Feature 0x${feature.toString(16)} not supported` : 'Feature not supported')
    this.name = 'HidppNotSupportedError'
  }
}

const waitMs = (pid: number): number => {
  return LOGITECH_WIRELESS_RECEIVERS.has(pid as Parameters<typeof LOGITECH_WIRELESS_RECEIVERS.has>[0])
    ? 50
    : HIDPP_WAIT_MS
}

export const getBE16 = (data: Uint8Array, offset: number): number => {
  return (data[offset] << 8) | data[offset + 1]
}

export const getLE16 = (data: Uint8Array, offset: number): number => {
  return data[offset] | (data[offset + 1] << 8)
}

export const setBE16 = (data: Uint8Array, offset: number, value: number): void => {
  data[offset] = (value >> 8) & 0xff
  data[offset + 1] = value & 0xff
}

export const setLE16 = (data: Uint8Array, offset: number, value: number): void => {
  data[offset] = value & 0xff
  data[offset + 1] = (value >> 8) & 0xff
}

/**
 * CRC-CCITT (0xFFFF) - used by Logitech for profile validation
 * Polynomial: 0x1021
 */
export function crcCcitt(data: Uint8Array, length?: number): number {
  const len = length ?? data.length
  let crc = 0xffff

  for (let i = 0; i < len; i++) {
    crc ^= data[i] << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc = crc << 1
      }
      crc &= 0xffff
    }
  }

  return crc
}

export type HidppReportType = 'short' | 'long'

type HidppReportParams = {
  reportType?: HidppReportType
  deviceIdx?: number
  subId: number // feature_index in HID++ 2.0
  address: number // function_id in HID++ 2.0
  parameters?: Uint8Array
}

/**
 * Byte 0: report_id (0x10 short, 0x11 long)
 * Byte 1: device_idx (0x00 wired, 0xFF receiver, 0x01-0x06 paired devices)
 * Byte 2: sub_id (feature_index in HID++ 2.0)
 * Byte 3: address (function_id | software_id in HID++ 2.0)
 * Bytes 4+: parameters (3 bytes for short, 16 bytes for long)
 */
export class HidppReport {
  private bytes: Uint8Array

  constructor(reportType: HidppReportType = 'short') {
    const length = reportType === 'short' ? SHORT_MESSAGE_LENGTH : LONG_MESSAGE_LENGTH
    this.bytes = new Uint8Array(length)
    this.bytes[0] = reportType === 'short' ? REPORT_ID_SHORT : REPORT_ID_LONG
  }

  static short(params: Omit<HidppReportParams, 'reportType'>): HidppReport {
    return HidppReport.from({ ...params, reportType: 'short' })
  }

  static long(params: Omit<HidppReportParams, 'reportType'>): HidppReport {
    return HidppReport.from({ ...params, reportType: 'long' })
  }

  static from({
    reportType = 'short',
    deviceIdx = HIDPP_WIRED_DEVICE_IDX,
    subId,
    address,
    parameters,
  }: HidppReportParams): HidppReport {
    const r = new HidppReport(reportType)
    r.deviceIdx = deviceIdx
    r.subId = subId
    r.address = address
    if (parameters) {
      r.parameters = parameters
    }
    return r
  }

  static fromBytes(bytes: Uint8Array): HidppReport {
    const reportType = bytes[0] === REPORT_ID_LONG ? 'long' : 'short'
    const r = new HidppReport(reportType)
    r.bytes.set(bytes.subarray(0, r.bytes.length))
    return r
  }

  get reportType(): HidppReportType {
    return this.bytes[0] === REPORT_ID_LONG ? 'long' : 'short'
  }

  get length(): number {
    return this.bytes.length
  }

  get reportId(): number {
    return this.bytes[0]
  }

  set reportId(v: number) {
    this.bytes[0] = v & 0xff
  }

  get deviceIdx(): number {
    return this.bytes[1]
  }

  set deviceIdx(v: number) {
    this.bytes[1] = v & 0xff
  }

  get subId(): number {
    return this.bytes[2]
  }

  set subId(v: number) {
    this.bytes[2] = v & 0xff
  }

  get address(): number {
    return this.bytes[3]
  }

  set address(v: number) {
    this.bytes[3] = v & 0xff
  }

  get parameters(): Uint8Array {
    return this.bytes.slice(4)
  }

  set parameters(params: Uint8Array) {
    const maxLen = this.bytes.length - 4
    this.bytes.fill(0, 4)
    this.bytes.set(params.subarray(0, maxLen), 4)
  }

  getParameter(index: number): number {
    return this.bytes[4 + index] ?? 0
  }

  setParameter(index: number, value: number): void {
    if (4 + index < this.bytes.length) {
      this.bytes[4 + index] = value & 0xff
    }
  }

  getParameterBE16(index: number): number {
    return getBE16(this.bytes, 4 + index)
  }

  setParameterBE16(index: number, value: number): void {
    setBE16(this.bytes, 4 + index, value)
  }

  get buffer(): ArrayBuffer {
    const copy = new Uint8Array(this.bytes.length)
    copy.set(this.bytes)
    return copy.buffer as ArrayBuffer
  }

  get payload(): ArrayBuffer {
    const copy = new Uint8Array(this.bytes.length - 1)
    copy.set(this.bytes.subarray(1))
    return copy.buffer as ArrayBuffer
  }

  get toBytes(): Uint8Array {
    return this.bytes.slice()
  }

  isError(): boolean {
    return this.subId === ERROR_MSG || this.subId === 0xff
  }

  getErrorCode(): number {
    if (this.isError()) {
      return this.getParameter(1)
    }
    return 0
  }

  getErrorMessage(): string {
    const code = this.getErrorCode()
    const messages: Record<number, string> = {
      [HIDPP20_ERROR.NO_ERROR]: 'No error',
      [HIDPP20_ERROR.UNKNOWN]: 'Unknown error',
      [HIDPP20_ERROR.INVALID_ARGUMENT]: 'Invalid argument',
      [HIDPP20_ERROR.OUT_OF_RANGE]: 'Out of range',
      [HIDPP20_ERROR.HW_ERROR]: 'Hardware error',
      [HIDPP20_ERROR.LOGITECH_INTERNAL]: 'Logitech internal error',
      [HIDPP20_ERROR.INVALID_FEATURE_INDEX]: 'Invalid feature index',
      [HIDPP20_ERROR.INVALID_FUNCTION_ID]: 'Invalid function ID',
      [HIDPP20_ERROR.BUSY]: 'Device busy',
      [HIDPP20_ERROR.UNSUPPORTED]: 'Not supported',
    }
    return messages[code] ?? `Unknown error code: 0x${code.toString(16)}`
  }

  /**
   * Send this report over the device's interrupt OUT endpoint and wait for the
   * matching response on the interrupt IN endpoint.
   *
   * Matching rules (HID++ 2.0):
   *   - The device echoes the same subId (feature index) and address byte
   *     (function_id | software_id) we sent. Notifications use software_id=0
   *     and are filtered out by the address match.
   *   - Error frames have subId=0x8F, address=original_subId, param[0]=original_address.
   *   - The device MAY answer a short (0x10) request with a long (0x11) report
   *     (e.g. MEMORY_READ on 0x8100 returns 16 bytes), so we accept both.
   */
  send(device: HidSession, maxRetries = HIDPP_MAX_RETRIES): Promise<HidppReport> {
    return device._lock.withLock(async () => {
      const expectedSubId = this.subId
      const expectedAddress = this.address
      const reportId = this.reportId
      const perAttemptMs = waitMs(device.hid.productId)
      const totalTimeoutMs = Math.max(HIDPP_TIMEOUT_MS, perAttemptMs * maxRetries * 4)

      let resolveResponse!: (r: HidppReport) => void
      let rejectResponse!: (e: unknown) => void
      const responsePromise = new Promise<HidppReport>((resolve, reject) => {
        resolveResponse = resolve
        rejectResponse = reject
      })

      const handler = (event: Event): void => {
        const e = event as HIDInputReportEvent
        if (e.reportId !== REPORT_ID_SHORT && e.reportId !== REPORT_ID_LONG) return

        const payload = new Uint8Array(e.data.buffer, e.data.byteOffset, e.data.byteLength)
        const fullBytes = new Uint8Array(payload.length + 1)
        fullBytes[0] = e.reportId
        fullBytes.set(payload, 1)
        const response = HidppReport.fromBytes(fullBytes)

        if (response.isError()) {
          if (response.address === expectedSubId && response.getParameter(0) === expectedAddress) {
            const errorCode = response.getErrorCode()
            if (errorCode === HIDPP10_ERROR.INVALID_SUBID) {
              rejectResponse(new HidppError('Invalid sub ID (HID++ 1.0 error)', errorCode))
              return
            }
            if (errorCode === HIDPP20_ERROR.UNSUPPORTED) {
              rejectResponse(new HidppNotSupportedError())
              return
            }
            rejectResponse(new HidppError(response.getErrorMessage(), errorCode))
            return
          }
          // unrelated error frame (different request); ignore
          return
        }

        if (response.subId === expectedSubId && response.address === expectedAddress) {
          resolveResponse(response)
        }
        // otherwise it's a notification or response to a different request; ignore
      }

      device.hid.addEventListener('inputreport', handler)

      let timeoutHandle: ReturnType<typeof setTimeout> | undefined
      try {
        const sendResult = await sendOutputReport(device.hid, reportId, this.payload)
        if (sendResult.error) throw sendResult.error

        const timeoutPromise = new Promise<HidppReport>((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new HidppTimeoutError()), totalTimeoutMs)
        })

        return await Promise.race([responsePromise, timeoutPromise])
      } finally {
        device.hid.removeEventListener('inputreport', handler)
        if (timeoutHandle !== undefined) clearTimeout(timeoutHandle)
      }
    })
  }
}

/**
 * Wire format of the address byte: `(function_id << 4) | software_id`.
 * `software_id` must be non-zero — id 0 is reserved by the spec for
 * device-originated notifications and using non-zero to reliably
 * filter notifications out of the response stream.
 */
export const hidpp20Request = (
  featureIndex: number,
  functionId: number,
  parameters?: Uint8Array,
  deviceIdx = HIDPP_WIRED_DEVICE_IDX,
): HidppReport => {
  const address = ((functionId & 0x0f) << 4) | (HIDPP_SOFTWARE_ID & 0x0f)
  return HidppReport.short({ deviceIdx, subId: featureIndex, address, parameters })
}

/** Build a long (20 byte) HID++ 2.0 request for commands with up to 16 parameter bytes. */
export const hidpp20RequestLong = (
  featureIndex: number,
  functionId: number,
  parameters?: Uint8Array,
  deviceIdx = HIDPP_WIRED_DEVICE_IDX,
): HidppReport => {
  const address = ((functionId & 0x0f) << 4) | (HIDPP_SOFTWARE_ID & 0x0f)
  return HidppReport.long({ deviceIdx, subId: featureIndex, address, parameters })
}
