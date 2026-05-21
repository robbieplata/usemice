import { describe, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import { Mutex } from '../../mutex.ts'
import {
  MockRazerDongleLedCapability,
  MockRazerDongleLedMultiCapability,
  MockRazerDpiCapability,
  MockRazerDpiStagesCapability,
  MockRazerIdleTimeCapability,
  MockRazerPollingCapability,
} from '../../mock/capabilities.ts'
import {
  decodeRazerProfileFile,
  encodeRazerProfileFile,
  exportRazerSettingsProfile,
  importRazerSettingsProfile,
  RazerProfileFileError,
  type RazerSettingsProfileData,
  validateRazerSettingsProfile,
} from '../profileFile.ts'
import type { DiscoveredRazerCapabilities, IRazerDeviceCore } from '../capabilities.ts'

const profileData = (): RazerSettingsProfileData => ({
  dpi: { x: 1600, y: 1600 },
  dpiStages: {
    activeStage: 2,
    dpiLevels: [
      [800, 800],
      [1600, 1600],
      [3200, 3200],
    ],
  },
  polling: { interval: 1000 },
  idleTime: { seconds: 300 },
  dongleLed: { mode: 2 },
  dongleLedMulti: { modes: [1, 2, 3] },
})

const stubDevice = (): IRazerDeviceCore => {
  const hid = {} as HIDDevice
  return { type: 'razer', hid, _lock: new Mutex() }
}

const capabilities = (): DiscoveredRazerCapabilities => {
  const device = stubDevice()
  return {
    dpi: new MockRazerDpiCapability(device, { txId: 0x1f, minDpi: 100, maxDpi: 30000 }, { x: 800, y: 800 }),
    dpiStages: new MockRazerDpiStagesCapability(
      device,
      { txId: 0x1f, minDpi: 100, maxDpi: 30000, maxStages: 5 },
      { activeStage: 1, dpiLevels: [[800, 800]] },
    ),
    polling: new MockRazerPollingCapability(
      device,
      { txId: 0x1f, version: 'legacy', supportedIntervals: [125, 500, 1000] },
      { interval: 500 },
    ),
    idleTime: new MockRazerIdleTimeCapability(device, { txId: 0x1f, minSeconds: 60, maxSeconds: 900 }, { seconds: 60 }),
    dongleLed: new MockRazerDongleLedCapability(device, { txId: 0x1f }, { mode: 1 }),
    dongleLedMulti: new MockRazerDongleLedMultiCapability(device, { txId: 0x1f }, { modes: [0, 0, 0] }),
  }
}

describe('Razer settings profile binary file', () => {
  it('round trips writable settings without JSON', () => {
    const encoded = encodeRazerProfileFile(profileData())
    expect(new TextDecoder().decode(encoded.slice(0, 4))).toBe('UMRP')

    const decoded = decodeRazerProfileFile(encoded)
    expect(decoded).toEqual(profileData())
  })

  it('rejects a corrupted checksum', () => {
    const encoded = encodeRazerProfileFile(profileData())
    encoded[encoded.length - 1] ^= 0xff

    expect(() => decodeRazerProfileFile(encoded)).toThrow(RazerProfileFileError)
  })

  it('rejects unsupported settings for the connected device', () => {
    expect(() => validateRazerSettingsProfile({ dongleLed: { mode: 1 } }, {})).toThrow(RazerProfileFileError)
  })

  it('validates DPI stages against connected device limits', () => {
    expect(() =>
      validateRazerSettingsProfile(
        {
          dpiStages: {
            activeStage: 1,
            dpiLevels: [[50000, 50000]],
          },
        },
        capabilities(),
      )
    ).toThrow(RazerProfileFileError)
  })

  it('exports and imports settings through supported capabilities', async () => {
    const source = capabilities()
    source.dpi!.data = { x: 2400, y: 2400 }
    source.dpiStages!.data = {
      activeStage: 3,
      dpiLevels: [
        [400, 400],
        [800, 800],
        [2400, 2400],
      ],
    }
    source.polling!.data = { interval: 125 }
    source.idleTime!.data = { seconds: 600 }
    source.dongleLed!.data = { mode: 3 }
    source.dongleLedMulti!.data = { modes: [4, 3, 2] }

    const target = capabilities()
    await importRazerSettingsProfile(target, exportRazerSettingsProfile(source))

    expect(target.dpi!.data).toEqual({ x: 2400, y: 2400 })
    expect(target.dpiStages!.data).toEqual(source.dpiStages!.data)
    expect(target.polling!.data).toEqual({ interval: 125 })
    expect(target.idleTime!.data).toEqual({ seconds: 600 })
    expect(target.dongleLed!.data).toEqual({ mode: 3 })
    expect(target.dongleLedMulti!.data).toEqual({ modes: [4, 3, 2] })
  })
})
