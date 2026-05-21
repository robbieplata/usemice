export type ProfileShareKind = 'logitech' | 'razer'

export type ProfileShareDevice = {
  vendorId: number
  productId: number
}

const PREFIX = 'v1:'
const KIND_CODE: Record<ProfileShareKind, number> = {
  logitech: 1,
  razer: 2,
}
const CODE_KIND: Record<number, ProfileShareKind> = Object.fromEntries(
  Object.entries(KIND_CODE).map(([kind, code]) => [code, kind]),
) as Record<number, ProfileShareKind>

export class ProfileShareTextError extends Error {
  override readonly name = 'ProfileShareTextError'
}

export function encodeProfileShareText(kind: ProfileShareKind, device: ProfileShareDevice, bytes: Uint8Array): string {
  validateDevice(device)
  const header = new Uint8Array(5)
  const headerView = new DataView(header.buffer)
  header[0] = KIND_CODE[kind]
  headerView.setUint16(1, device.vendorId, true)
  headerView.setUint16(3, device.productId, true)
  const payload = new Uint8Array(header.length + bytes.length)
  payload.set(header)
  payload.set(bytes, header.length)
  return `${PREFIX}${bytesToBase64Url(payload)}`
}

export function decodeProfileShareText(kind: ProfileShareKind, device: ProfileShareDevice, text: string): Uint8Array {
  validateDevice(device)
  const value = text.trim()
  if (!value.startsWith(PREFIX)) throw new ProfileShareTextError('Expected a v1 profile share string')
  const payload = base64UrlToBytes(value.slice(PREFIX.length))
  if (payload.length < 5) throw new ProfileShareTextError('Profile share text is malformed')

  const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength)
  const actualKind = CODE_KIND[payload[0]]
  if (actualKind !== kind) throw new ProfileShareTextError(`Expected a ${kind} profile share string`)

  const vendorId = view.getUint16(1, true)
  const productId = view.getUint16(3, true)
  if (vendorId !== device.vendorId || productId !== device.productId) {
    throw new ProfileShareTextError(
      `Profile share is for VID ${hex16(vendorId)}, PID ${hex16(productId)}, not this device`,
    )
  }
  return payload.slice(5)
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function base64UrlToBytes(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new ProfileShareTextError('Profile share text is malformed')

  const padded = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  try {
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
  } catch {
    throw new ProfileShareTextError('Profile share text is malformed')
  }
}

function validateDevice(device: ProfileShareDevice): void {
  if (!isUint16(device.vendorId) || !isUint16(device.productId)) {
    throw new ProfileShareTextError('Device identity is invalid')
  }
}

function isUint16(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0xffff
}

function hex16(value: number): string {
  return `0x${value.toString(16).padStart(4, '0')}`
}
