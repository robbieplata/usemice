import { describe, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import { reaction, runInAction } from 'mobx'
import {
  HidppDerivedDpiCapability,
  HidppDerivedPollingCapability,
  HidppProfileCapability,
  type HidppProfileData,
  type IHidppDeviceCore,
} from '../capabilities.ts'
import { Mutex } from '../../../mutex.ts'

const baseData = (): HidppProfileData => ({
  description: {
    memoryModel: 0,
    profileFormat: 0,
    macroFormat: 0,
    profileCount: 2,
    profileCountOOB: 0,
    buttonCount: 11,
    sectorCount: 8,
    sectorSize: 256,
    mechanicalLayout: 0,
    variousInfo: 0,
  },
  activeProfileIndex: 0,
  profiles: [
    {
      sector: 0x0101,
      name: 'A',
      reportRateMs: 1,
      dpiStages: [400, 800, 1600],
      activeDpiIndex: 1,
      dpiShiftIndex: 2,
      dirty: false,
    },
    {
      sector: 0x0102,
      name: 'B',
      reportRateMs: 8,
      dpiStages: [800, 1600],
      activeDpiIndex: 0,
      dpiShiftIndex: 1,
      dirty: false,
    },
  ],
})

const stubDevice = (): IHidppDeviceCore => {
  const hid = {} as HIDDevice
  return { type: 'hidpp', hid, _lock: new Mutex() } as IHidppDeviceCore
}

describe('HidppProfileCapability state management', () => {
  it('updateActiveProfile replaces data immutably and triggers reactions', () => {
    const cap = new HidppProfileCapability(
      stubDevice(),
      {
        profileCount: 2,
        dpiMin: 200,
        dpiMax: 25600,
        dpiStep: 50,
        maxDpiStages: 5,
        hasGShift: false,
        hasDpiShift: false,
      },
      baseData(),
    )

    const observed: number[] = []
    const dispose = reaction(
      () => cap.activeProfile.dpiStages[0],
      (dpi) => observed.push(dpi),
      { fireImmediately: true },
    )

    cap.updateActiveProfile((p) => ({ ...p, dpiStages: [500, ...p.dpiStages.slice(1)], dirty: true }))
    cap.updateActiveProfile((p) => ({ ...p, dpiStages: [600, ...p.dpiStages.slice(1)], dirty: true }))

    expect(observed).toEqual([400, 500, 600])
    expect(cap.activeProfile.dirty).toBe(true)
    expect(cap.activeProfile.dpiStages[1]).toBe(800) // untouched
    expect(cap.data.profiles[1].dpiStages[0]).toBe(800) // other profile untouched

    dispose()
  })

  it('hasDirtyProfiles reflects current state', () => {
    const cap = new HidppProfileCapability(
      stubDevice(),
      {
        profileCount: 2,
        dpiMin: 200,
        dpiMax: 25600,
        dpiStep: 50,
        maxDpiStages: 5,
        hasGShift: false,
        hasDpiShift: false,
      },
      baseData(),
    )
    expect(cap.hasDirtyProfiles).toBe(false)
    cap.updateActiveProfile((p) => ({ ...p, dirty: true }))
    expect(cap.hasDirtyProfiles).toBe(true)
  })

  it('set with no dirty profiles is a no-op writer and stores the new value', async () => {
    const cap = new HidppProfileCapability(
      stubDevice(),
      {
        profileCount: 2,
        dpiMin: 200,
        dpiMax: 25600,
        dpiStep: 50,
        maxDpiStages: 5,
        hasGShift: false,
        hasDpiShift: false,
      },
      baseData(),
    )

    const next = baseData()
    next.activeProfileIndex = 1
    await cap.set(next)
    expect(cap.data.activeProfileIndex).toBe(1)
  })
})

describe('HidppDerivedDpiCapability', () => {
  it('reads DPI from the active profile/stage', () => {
    const profile = new HidppProfileCapability(
      stubDevice(),
      {
        profileCount: 2,
        dpiMin: 200,
        dpiMax: 25600,
        dpiStep: 50,
        maxDpiStages: 5,
        hasGShift: false,
        hasDpiShift: false,
      },
      baseData(),
    )
    const dpi = new HidppDerivedDpiCapability(stubDevice(), profile, { minDpi: 200, maxDpi: 25600, step: 50 })
    expect(dpi.data).toEqual({ x: 800, y: 800 })

    // Switch the active stage; computed should reflect the change.
    runInAction(() => {
      profile.updateActiveProfile((p) => ({ ...p, activeDpiIndex: 0 }))
    })
    expect(dpi.data).toEqual({ x: 400, y: 400 })
  })
})

describe('HidppDerivedPollingCapability', () => {
  it('reads polling rate (Hz) from active profile reportRateMs', () => {
    const profile = new HidppProfileCapability(
      stubDevice(),
      {
        profileCount: 2,
        dpiMin: 200,
        dpiMax: 25600,
        dpiStep: 50,
        maxDpiStages: 5,
        hasGShift: false,
        hasDpiShift: false,
      },
      baseData(),
    )
    const polling = new HidppDerivedPollingCapability(stubDevice(), profile, {
      supportedIntervals: [125, 250, 500, 1000],
    })
    expect(polling.data.interval).toBe(1000) // profile A: 1ms = 1000Hz

    runInAction(() => {
      profile.updateActiveProfile((p) => ({ ...p, reportRateMs: 8 }))
    })
    expect(polling.data.interval).toBe(125)
  })
})
