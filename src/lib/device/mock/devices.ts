import { Device } from '@/lib/device/device'
import { VID_RAZER, PID_RAZER } from '@/lib/device/razer/constants'
import { VID_LOGITECH } from '@/lib/device/logitech/constants'
import type { IRazerDeviceCore } from '@/lib/device/razer/capabilities'
import type { IHidppDeviceCore, HidppProfileData } from '@/lib/device/logitech/capabilities'
import { MockHidDevice, asHidDevice } from './mockHid'
import {
  MockRazerDpiCapability,
  MockRazerDpiStagesCapability,
  MockRazerPollingCapability,
  MockRazerChargeLevelCapability,
  MockRazerChargeStatusCapability,
  MockRazerIdleTimeCapability,
  MockRazerFirmwareVersionCapability,
  MockRazerSerialCapability,
  MockHidppProfileCapability,
  MockHidppDerivedDpiCapability,
  MockHidppDerivedPollingCapability,
  MockHidppChargeLevelCapability
} from './capabilities'

const mockSession = <Core>(device: Device): Core => {
  // The capability classes only use device._lock and device.hid via HidSession;
  // the mock subclasses override every method that would touch them.
  return { hid: device.hid, _lock: device._lock } as unknown as Core
}

export function buildDeathadderV3ProWirelessMock(): Device {
  const hid = new MockHidDevice({
    vendorId: VID_RAZER,
    productId: PID_RAZER.DEATHADDER_V3_PRO_WIRELESS,
    productName: 'Razer DeathAdder V3 Pro'
  })
  const device = new Device(asHidDevice(hid), 'razer')
  const core = mockSession<IRazerDeviceCore>(device)
  const txId = 0x1f

  device.setCapabilities({
    dpi: new MockRazerDpiCapability(core, { txId, minDpi: 100, maxDpi: 16000 }, { x: 1600, y: 1600 }),
    dpiStages: new MockRazerDpiStagesCapability(
      core,
      { txId, minDpi: 100, maxDpi: 16000, maxStages: 5 },
      {
        dpiLevels: [
          [400, 400],
          [800, 800],
          [1600, 1600],
          [3200, 3200],
          [6400, 6400]
        ],
        activeStage: 3
      }
    ),
    polling: new MockRazerPollingCapability(
      core,
      { txId, version: 'legacy', supportedIntervals: [125, 500, 1000] },
      { interval: 1000 }
    ),
    idleTime: new MockRazerIdleTimeCapability(
      core,
      { txId, minSeconds: 60, maxSeconds: 900 },
      { seconds: 300 }
    ),
    chargeLevel: new MockRazerChargeLevelCapability(core, { txId }, { percentage: 78 }),
    chargeStatus: new MockRazerChargeStatusCapability(core, { txId }, { status: false }),
    firmwareVersion: new MockRazerFirmwareVersionCapability(core, { txId }, { major: 1, minor: 2 }),
    serial: new MockRazerSerialCapability(core, { txId }, { serialNumber: 'MOCK-DAV3P-0001' })
  })
  device.status = 'Ready'
  return device
}

const GPRO_SUPERLIGHT2_PID = 0xc54d

const gproProfile = (sector: number, name: string, baseDpi: number, reportRateMs: number): HidppProfileData['profiles'][number] => ({
  sector,
  name,
  reportRateMs,
  dpiStages: [Math.max(100, baseDpi - 800), baseDpi, baseDpi + 800, baseDpi + 2400, baseDpi + 4800],
  activeDpiIndex: 1,
  dpiShiftIndex: 0,
  dirty: false
})

export function buildGProXSuperlight2Mock(): Device {
  const hid = new MockHidDevice({
    vendorId: VID_LOGITECH,
    productId: GPRO_SUPERLIGHT2_PID,
    productName: 'G Pro X Superlight 2'
  })
  const device = new Device(asHidDevice(hid), 'hidpp')
  const core = mockSession<IHidppDeviceCore>(device)

  const profileData: HidppProfileData = {
    description: {
      memoryModel: 0x01,
      profileFormat: 0x05,
      macroFormat: 0x01,
      profileCount: 5,
      profileCountOOB: 1,
      buttonCount: 7,
      sectorCount: 16,
      sectorSize: 256,
      mechanicalLayout: 0x0a, // g-shift = 2 (bits 0-1), dpi-shift = 2 (bits 2-3)
      variousInfo: 0x00
    },
    activeProfileIndex: 0,
    profiles: [
      gproProfile(1, 'Profile 1', 1600, 1),
      gproProfile(2, 'Profile 2', 800, 1),
      gproProfile(3, 'Profile 3', 3200, 1),
      gproProfile(4, 'Profile 4', 6400, 2),
      gproProfile(5, 'Profile 5', 12800, 4)
    ]
  }

  const profile = new MockHidppProfileCapability(
    core,
    {
      profileCount: 5,
      dpiMin: 100,
      dpiMax: 32000,
      dpiStep: 50,
      maxDpiStages: 5,
      hasGShift: true,
      hasDpiShift: true
    },
    profileData
  )

  device.setCapabilities({
    profile,
    dpi: new MockHidppDerivedDpiCapability(core, profile, { minDpi: 100, maxDpi: 32000, step: 50 }),
    polling: new MockHidppDerivedPollingCapability(core, profile, {
      supportedIntervals: [125, 250, 500, 1000, 2000]
    }),
    chargeLevel: new MockHidppChargeLevelCapability(core, { percentage: 64 })
  })
  device.status = 'Ready'
  return device
}
