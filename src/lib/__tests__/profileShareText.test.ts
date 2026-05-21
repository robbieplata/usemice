import { describe, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import {
  decodeProfileShareText,
  encodeProfileShareText,
  type ProfileShareKind,
  ProfileShareTextError,
} from '../profileShareText.ts'

const bytes = () => new Uint8Array([0, 1, 2, 3, 250, 251, 252, 253, 254, 255])
const device = { vendorId: 0x1532, productId: 0x00b7 }

describe('profile share text', () => {
  for (const kind of ['logitech', 'razer'] as ProfileShareKind[]) {
    it(`round trips ${kind} binary profile bytes`, () => {
      const text = encodeProfileShareText(kind, device, bytes())
      expect(text.startsWith('v1:')).toBe(true)
      expect(decodeProfileShareText(kind, device, text)).toEqual(bytes())
    })
  }

  it('rejects share text for the wrong profile kind', () => {
    const text = encodeProfileShareText('razer', device, bytes())
    expect(() => decodeProfileShareText('logitech', device, text)).toThrow(ProfileShareTextError)
  })

  it('rejects share text for the wrong device product id', () => {
    const text = encodeProfileShareText('razer', device, bytes())
    expect(() => decodeProfileShareText('razer', { ...device, productId: 0x00c1 }, text)).toThrow(
      ProfileShareTextError,
    )
  })

  it('rejects share text for the wrong device vendor id', () => {
    const text = encodeProfileShareText('razer', device, bytes())
    expect(() => decodeProfileShareText('razer', { ...device, vendorId: 0x046d }, text)).toThrow(
      ProfileShareTextError,
    )
  })

  it('rejects malformed base64url payloads', () => {
    expect(() => decodeProfileShareText('razer', device, 'v1:not valid')).toThrow(ProfileShareTextError)
  })

  it('rejects invalid device identity when encoding', () => {
    expect(() => encodeProfileShareText('razer', { vendorId: -1, productId: 0x00b7 }, bytes())).toThrow(
      ProfileShareTextError,
    )
  })

  it('allows whitespace around pasted text', () => {
    const text = `\n  ${encodeProfileShareText('logitech', device, bytes())}  \n`
    expect(decodeProfileShareText('logitech', device, text)).toEqual(bytes())
  })
})
