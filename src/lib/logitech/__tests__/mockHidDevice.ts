import { Mutex } from '../../mutex.ts'
import type { HidSession } from '../../hid.ts'

export type RecordedSend = {
  via: 'feature' | 'output'
  reportId: number
  data: Uint8Array
}

type InputEvent = {
  reportId: number
  data: DataView
  device: unknown
  type: 'inputreport'
}

type InputReportListener = (e: InputEvent) => void

const listenerMap = new WeakMap<EventListenerOrEventListenerObject, InputReportListener>()

export class MockHidDevice {
  opened = true
  vendorId = 0x046d
  productId = 0xc09d
  productName = 'Mock Logitech Mouse'
  collections: HIDCollectionInfo[] = []

  sends: RecordedSend[] = []
  featureResponses = new Map<number, Uint8Array[]>()
  /** queued input reports - all of these are flushed on every sendReport. */
  inputQueue: { reportId: number; data: Uint8Array }[] = []
  /**
   * On each `sendReport`, it's called once with
   * the recorded send; whatever it returns is dispatched as inputreport
   * event(s) on the next microtask, AFTER any items already on `inputQueue`.
   * Return `undefined` to dispatch nothing.
   */
  responder?: (
    send: RecordedSend,
  ) => { reportId: number; data: Uint8Array } | { reportId: number; data: Uint8Array }[] | undefined

  private listeners = new Set<InputReportListener>()

  enqueueFeatureResponse(reportId: number, data: Uint8Array): void {
    const q = this.featureResponses.get(reportId) ?? []
    q.push(data)
    this.featureResponses.set(reportId, q)
  }

  enqueueInputReport(reportId: number, data: Uint8Array): void {
    this.inputQueue.push({ reportId, data })
  }

  sendFeatureReport(reportId: number, buffer: BufferSource): Promise<void> {
    this.sends.push({ via: 'feature', reportId, data: toUint8(buffer) })
    return Promise.resolve()
  }

  receiveFeatureReport(reportId: number): Promise<DataView> {
    const q = this.featureResponses.get(reportId) ?? []
    const data = q.shift()
    if (!data) throw new Error(`No queued feature response for reportId 0x${reportId.toString(16)}`)
    return Promise.resolve(new DataView(data.buffer, data.byteOffset, data.byteLength))
  }

  sendReport(reportId: number, buffer: BufferSource): Promise<void> {
    const send: RecordedSend = { via: 'output', reportId, data: toUint8(buffer) }
    this.sends.push(send)

    queueMicrotask(() => {
      while (this.inputQueue.length > 0) {
        const next = this.inputQueue.shift()!
        this.dispatchInputReport(next.reportId, next.data)
      }
      if (this.responder) {
        const result = this.responder(send)
        if (result !== undefined) {
          const arr = Array.isArray(result) ? result : [result]
          for (const item of arr) this.dispatchInputReport(item.reportId, item.data)
        }
      }
    })
    return Promise.resolve()
  }

  private dispatchInputReport(reportId: number, data: Uint8Array): void {
    const event: InputEvent = {
      reportId,
      data: new DataView(data.buffer, data.byteOffset, data.byteLength),
      device: this,
      type: 'inputreport',
    }
    for (const listener of this.listeners) listener(event)
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (type !== 'inputreport') return
    const fn = typeof listener === 'function'
      ? (listener as unknown as InputReportListener)
      : ((e: InputEvent) => listener.handleEvent(e as unknown as Event)) as InputReportListener
    listenerMap.set(listener, fn)
    this.listeners.add(fn)
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (type !== 'inputreport') return
    const fn = listenerMap.get(listener)
    if (fn) {
      this.listeners.delete(fn)
      listenerMap.delete(listener)
    }
  }

  open(): Promise<void> {
    this.opened = true
    return Promise.resolve()
  }

  close(): Promise<void> {
    this.opened = false
    return Promise.resolve()
  }

  forget(): Promise<void> {
    this.opened = false
    return Promise.resolve()
  }
}

const toUint8 = (buffer: BufferSource): Uint8Array => {
  if (buffer instanceof ArrayBuffer) return new Uint8Array(buffer.slice(0))
  return new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))
}

export type MockSession = HidSession & { hid: MockHidDevice & HIDDevice }

export const createMockSession = (init?: Partial<MockHidDevice>): MockSession => {
  const hid = Object.assign(new MockHidDevice(), init)
  return {
    hid: hid as unknown as MockHidDevice & HIDDevice,
    _lock: new Mutex(),
  }
}
