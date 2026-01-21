export const RAZER_REPORT_SIZE = 90
export const RAZER_REPORT_ID = 0x00
const PAYLOAD_OFFSET = 8
const CRC_INDEX = 88
const MAX_ARGS = CRC_INDEX - PAYLOAD_OFFSET

type RazerReportParams = {
  idByte?: number
  commandClass: number
  commandId: number
  dataSize: number
  args?: Uint8Array
}

export class RazerReport {
  private readonly bytes = new Uint8Array(RAZER_REPORT_SIZE)

  static from({ idByte, commandClass, commandId, dataSize, args }: RazerReportParams): RazerReport {
    const r = new RazerReport()
    r.status = 0x00
    r.idByte = idByte ?? 0x00
    r.commandClass = commandClass
    r.commandId = commandId
    r.dataSize = dataSize
    r.args = args ?? new Uint8Array(0)
    r.crc = RazerReport.computeCrc(r.bytes)
    return r
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

  // aka the transaction id, but for razer idByte is device specific
  get idByte() {
    return this.getByte(1)
  }
  set idByte(v: number) {
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
