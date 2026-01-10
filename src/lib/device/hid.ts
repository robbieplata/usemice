import { Effect } from 'effect'

export const RAZER_REPORT_SIZE = 90
export const RAZER_VID = 0x1532

export const openDevice = (hid: HIDDevice) => Effect.promise(() => hid.open().then(() => hid))

export const sendFeatureReport = (hid: HIDDevice, report: Uint8Array<ArrayBuffer>) =>
  Effect.promise(() => hid.sendFeatureReport(0, report))

export const receiveFeatureReport = (hid: HIDDevice) =>
  Effect.promise<Uint8Array>(() =>
    hid.receiveFeatureReport(0).then((view) => new Uint8Array(view.buffer, view.byteOffset, view.byteLength))
  )

const crc = (data: Uint8Array, start: number, end: number): number => {
  let crc = 0
  for (let i = start; i < end; i++) crc ^= data[i]
  return crc
}

export const buildRazerReport = (
  transactionId: number,
  dataSize: number,
  commandClass: number,
  commandId: number,
  args: Uint8Array
): Uint8Array<ArrayBuffer> => {
  const buf = new ArrayBuffer(RAZER_REPORT_SIZE)
  const report = new Uint8Array(buf)

  report[0] = 0x00
  report[1] = 0x00
  report[2] = transactionId & 0xff
  report[3] = 0x00
  report[4] = 0x00
  report[5] = dataSize & 0xff
  report[6] = commandClass & 0xff
  report[7] = commandId & 0xff

  if (args.length > 0) report.set(args.subarray(0, Math.min(args.length, 88 - 8)), 8)

  report[88] = crc(report, 2, 88) & 0xff
  report[89] = 0x00

  return report
}

export class RequestHidDeviceError extends Error {
  readonly _tag = 'RequestHidDeviceError'
  constructor(message: string, readonly cause?: unknown) {
    super(message)
  }
}

export const requestDevice = (options?: HIDDeviceRequestOptions) =>
  Effect.tryPromise({
    try: async () => {
      const devices = await navigator.hid.requestDevice(options ?? { filters: [{ vendorId: RAZER_VID }] })
      const device = devices[0]
      if (!device) throw new RequestHidDeviceError('No device selected')
      return device
    },
    catch: (cause) =>
      cause instanceof RequestHidDeviceError ? cause : new RequestHidDeviceError('Failed to request HID device', cause)
  })
