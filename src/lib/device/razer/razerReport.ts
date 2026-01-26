import { receiveBuffer, sendBuffer, TransactionError, type HidSession } from '@/lib/device/hid'
import { toast } from 'sonner'

const RAZER_REPORT_SIZE = 90
const RAZER_REPORT_ID = 0x00
const PAYLOAD_OFFSET = 8
const CRC_INDEX = 88
const MAX_ARGS = CRC_INDEX - PAYLOAD_OFFSET

enum RAZER_STATUS {
  NEW = 0x00,
  BUSY = 0x01,
  SUCCESS = 0x02,
  FAILURE = 0x03,
  TIMEOUT = 0x04,
  NOT_SUPPORTED = 0x05
}

export const _sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type RazerReportParams = {
  txId?: number
  commandClass: number
  commandId: number
  dataSize: number
  args?: Uint8Array
}

export class RazerReport {
  private readonly bytes = new Uint8Array(RAZER_REPORT_SIZE)

  static from({ txId, commandClass, commandId, dataSize, args }: RazerReportParams): RazerReport {
    const r = new RazerReport()
    r.status = 0x00
    r.txId = txId ?? 0x00
    r.commandClass = commandClass
    r.commandId = commandId
    r.dataSize = dataSize
    r.args = args ?? new Uint8Array(0)
    r.crc = RazerReport.computeCrc(r.bytes)
    return r
  }

  async sendReport(device: HidSession, maxRetries = 10): Promise<RazerReport> {
    return device._lock.withLock(async () => {
      const expectedCommandClass = this.commandClass
      const expectedCommandId = this.commandId

      const result = await sendBuffer(device.hid, RAZER_REPORT_ID, this.buffer)
      if (result.error) throw result.error
      await _sleep(20)

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const recv = await receiveBuffer(device.hid, RAZER_REPORT_ID)
        if (recv.error) throw recv.error

        const response = RazerReport.fromBytes(recv.value)
        if (response.commandClass !== expectedCommandClass || response.commandId !== expectedCommandId) {
          await _sleep(20)
          continue
        }
        switch (response.status) {
          case RAZER_STATUS.SUCCESS:
            return response
          case RAZER_STATUS.BUSY:
            await _sleep(20)
            continue
          case RAZER_STATUS.FAILURE:
            toast('Device returned failure status')
            throw new TransactionError('Device returned failure status')
          case RAZER_STATUS.TIMEOUT:
            throw new TransactionError('Device returned timeout status')
          case RAZER_STATUS.NOT_SUPPORTED:
            toast('Command not supported by device')
            throw new TransactionError('Command not supported by device')
          default:
            await _sleep(20)
            continue
        }
      }
      throw new TransactionError('Max retries exceeded waiting for device response')
    })
  }

  static fromBytes(bytes: Uint8Array): RazerReport {
    const r = new RazerReport()
    const crc = RazerReport.computeCrc(bytes)
    if (crc !== bytes[CRC_INDEX]) {
      throw new Error(
        `Invalid CRC on RazerReport: expected 0x${bytes[CRC_INDEX].toString(16)}, computed 0x${crc.toString(16)}`
      )
    }
    r.bytes.set(bytes.subarray(0, RAZER_REPORT_SIZE))
    return r
  }

  get toBytes(): Uint8Array {
    const out = this.bytes.slice()
    out[CRC_INDEX] = RazerReport.computeCrc(out)
    return out
  }

  get buffer(): ArrayBuffer {
    const buffer = new ArrayBuffer(RAZER_REPORT_SIZE)
    const view = new Uint8Array(buffer)
    view.set(this.toBytes)
    return buffer
  }

  private static computeCrc(data: Uint8Array): number {
    let crc = 0
    for (let i = 2; i < CRC_INDEX; i++) crc ^= data[i]
    return crc & 0xff
  }

  private getByte(i: number) {
    return this.bytes[i]
  }
  private setByte(i: number, v: number) {
    this.bytes[i] = v & 0xff
  }

  get status() {
    return this.getByte(0)
  }
  set status(v: number) {
    this.setByte(0, v)
  }

  // aka the transaction id, but for razer txId is device specific
  get txId() {
    return this.getByte(1)
  }
  set txId(v: number) {
    this.setByte(1, v)
  }

  get dataSize() {
    return this.getByte(5)
  }
  set dataSize(v: number) {
    this.setByte(5, v)
  }

  get commandClass() {
    return this.getByte(6)
  }
  set commandClass(v: number) {
    this.setByte(6, v)
  }

  get commandId() {
    return this.getByte(7)
  }
  set commandId(v: number) {
    this.setByte(7, v)
  }

  get args(): Uint8Array {
    return this.bytes.slice(PAYLOAD_OFFSET, CRC_INDEX)
  }

  set args(a: Uint8Array) {
    this.bytes.fill(0, PAYLOAD_OFFSET, CRC_INDEX)
    if (a.length) this.bytes.set(a.subarray(0, MAX_ARGS), PAYLOAD_OFFSET)
  }

  get crc() {
    return this.getByte(CRC_INDEX)
  }
  set crc(v: number) {
    this.setByte(CRC_INDEX, v)
  }
}
