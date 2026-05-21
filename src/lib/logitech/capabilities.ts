import { action, computed, makeObservable, observable } from 'mobx'
import {
  logitechGetAllProfiles,
  logitechGetBatteryLevel,
  logitechGetDpiInfo,
  logitechGetPollingRateInfo,
  logitechGetProfilesDescription,
  logitechSetActiveProfile,
  logitechSetDpi,
  logitechSetPollingRate,
  logitechWriteProfile,
} from './protocol.ts'
import type { OnboardProfilesDescription } from './protocol.ts'
import type { HidSession } from '../hid.ts'
import { getFeatures } from './features.ts'
import { HIDPP_PAGE, ONBOARD_PROFILE } from './constants.ts'

export interface IHidppDeviceCore extends HidSession {
  readonly type: 'hidpp'
}

export type HidppProfile = {
  sector: number
  name: string
  reportRateMs: number
  dpiStages: number[]
  activeDpiIndex: number
  dpiShiftIndex: number
  dirty: boolean
}

export type HidppProfileData = {
  activeProfileIndex: number
  profiles: HidppProfile[]
  description: OnboardProfilesDescription
}

export class HidppProfileCapability {
  readonly info: {
    profileCount: number
    dpiMin: number
    dpiMax: number
    dpiStep: number
    maxDpiStages: number
    hasGShift: boolean
    hasDpiShift: boolean
  }
  @observable
  accessor data: HidppProfileData

  constructor(
    private device: IHidppDeviceCore,
    info: HidppProfileCapability['info'],
    initialData: HidppProfileData,
  ) {
    this.info = info
    this.data = initialData
  }

  @action
  async refresh(): Promise<void> {
    const { description, activeProfileIndex, profiles } = await logitechGetAllProfiles(this.device)
    this.data = {
      description,
      activeProfileIndex,
      profiles: profiles.map((p) => ({
        sector: p.sector,
        name: p.name,
        reportRateMs: p.reportRateMs,
        dpiStages: p.dpiStages,
        activeDpiIndex: p.defaultDpiIndex,
        dpiShiftIndex: p.dpiShiftIndex,
        dirty: false,
      })),
    }
  }

  @action
  async set(value: HidppProfileData): Promise<void> {
    const clearedProfiles: HidppProfile[] = []
    for (const profile of value.profiles) {
      if (!profile.dirty) {
        clearedProfiles.push(profile)
        continue
      }
      await logitechWriteProfile(this.device, profile.sector, value.description.sectorSize, {
        reportRateMs: profile.reportRateMs,
        defaultDpiIndex: profile.activeDpiIndex,
        dpiShiftIndex: profile.dpiShiftIndex,
        dpiStages: profile.dpiStages,
        name: profile.name,
      })
      clearedProfiles.push({ ...profile, dirty: false })
    }
    this.data = { ...value, profiles: clearedProfiles }
  }

  @action
  async switchTo(index: number): Promise<void> {
    if (index < 0 || index >= this.data.profiles.length) {
      throw new Error(`Invalid profile index: ${index}`)
    }

    const currentProfile = this.data.profiles[this.data.activeProfileIndex]
    if (currentProfile.dirty) {
      await this.saveProfile(currentProfile)
    }

    const newProfile = this.data.profiles[index]
    await logitechSetActiveProfile(this.device, newProfile.sector)
    this.data = { ...this.data, activeProfileIndex: index }
  }

  @action
  async saveAll(): Promise<void> {
    const dirtyProfiles = this.data.profiles.filter((p) => p.dirty)
    for (const profile of dirtyProfiles) {
      await this.saveProfile(profile)
    }
  }

  @action
  updateActiveProfile(updater: (profile: HidppProfile) => HidppProfile): void {
    const idx = this.data.activeProfileIndex
    const profiles = this.data.profiles.map((p, i) => (i === idx ? updater(p) : p))
    this.data = { ...this.data, profiles }
  }

  private async saveProfile(profile: HidppProfile): Promise<void> {
    await logitechWriteProfile(this.device, profile.sector, this.data.description.sectorSize, {
      reportRateMs: profile.reportRateMs,
      defaultDpiIndex: profile.activeDpiIndex,
      dpiShiftIndex: profile.dpiShiftIndex,
      dpiStages: profile.dpiStages,
      name: profile.name,
    })
    this.data = {
      ...this.data,
      profiles: this.data.profiles.map((p) => (p.sector === profile.sector ? { ...p, dirty: false } : p)),
    }
  }

  get hasDirtyProfiles(): boolean {
    return this.data.profiles.some((p) => p.dirty)
  }

  get activeProfile(): HidppProfile {
    return this.data.profiles[this.data.activeProfileIndex]
  }
}

export class HidppDerivedDpiCapability {
  readonly info: { minDpi: number; maxDpi: number; step?: number }

  constructor(
    private device: IHidppDeviceCore,
    private profileCap: HidppProfileCapability,
    info: HidppDerivedDpiCapability['info'],
  ) {
    this.info = info
    makeObservable(this, {
      data: computed,
    })
  }

  get data(): { x: number; y: number } {
    const { profiles, activeProfileIndex } = this.profileCap.data
    const p = profiles[activeProfileIndex]
    const dpi = p.dpiStages[p.activeDpiIndex] ?? p.dpiStages[0]
    return { x: dpi, y: dpi }
  }

  async set(value: { x: number; y: number }): Promise<void> {
    await logitechSetDpi(this.device, value.x)
    this.profileCap.updateActiveProfile((p) => {
      if (p.activeDpiIndex >= p.dpiStages.length) return p
      const dpiStages = [...p.dpiStages]
      dpiStages[p.activeDpiIndex] = value.x
      return { ...p, dpiStages, dirty: true }
    })
  }

  async setDpiStage(stageIndex: number, value: number): Promise<void> {
    await logitechSetDpi(this.device, value)
    this.profileCap.updateActiveProfile((p) => {
      if (stageIndex < 0 || stageIndex >= p.dpiStages.length) return p
      const dpiStages = [...p.dpiStages]
      dpiStages[stageIndex] = value
      return { ...p, dpiStages, dirty: true }
    })
  }

  async setActiveDpiIndex(index: number): Promise<void> {
    const active = this.profileCap.activeProfile
    if (index < 0 || index >= active.dpiStages.length) {
      throw new Error(`Invalid DPI stage index: ${index}`)
    }
    await logitechSetDpi(this.device, active.dpiStages[index])
    this.profileCap.updateActiveProfile((p) => ({ ...p, activeDpiIndex: index, dirty: true }))
  }
}

export class HidppDerivedPollingCapability {
  readonly info: { supportedIntervals: number[] }

  constructor(
    private device: IHidppDeviceCore,
    private profileCap: HidppProfileCapability,
    info: HidppDerivedPollingCapability['info'],
  ) {
    this.info = info
    makeObservable(this, {
      data: computed,
    })
  }

  get data(): { interval: number } {
    const { profiles, activeProfileIndex } = this.profileCap.data
    const p = profiles[activeProfileIndex]
    return { interval: Math.round(1000 / p.reportRateMs) }
  }

  async set(value: { interval: number }): Promise<void> {
    await logitechSetPollingRate(this.device, value.interval)
    const reportRateMs = 1000 / Math.max(1, value.interval)
    this.profileCap.updateActiveProfile((p) => ({ ...p, reportRateMs, dirty: true }))
  }
}

export class HidppChargeLevelCapability {
  readonly info: Record<string, never> = {}
  @observable
  accessor data: { percentage: number }

  constructor(
    private device: IHidppDeviceCore,
    initialData: { percentage: number },
  ) {
    this.data = initialData
  }

  @action
  async refresh(): Promise<void> {
    const battery = await logitechGetBatteryLevel(this.device)
    this.data = { percentage: battery.level }
  }
}

export type HidppCapabilityClasses = {
  chargeLevel: HidppChargeLevelCapability
  dpi: HidppDerivedDpiCapability
  polling: HidppDerivedPollingCapability
  profile: HidppProfileCapability
}

export type HidppCapabilityKey = keyof HidppCapabilityClasses
export type HidppCapabilityInfoMap = { [K in HidppCapabilityKey]: HidppCapabilityClasses[K]['info'] }
export type HidppCapabilityDataMap = { [K in HidppCapabilityKey]: HidppCapabilityClasses[K]['data'] }

export type DiscoveredHidppCapabilities = {
  [K in HidppCapabilityKey]?: HidppCapabilityClasses[K]
}

export async function discoverHidppCapabilities(device: IHidppDeviceCore): Promise<DiscoveredHidppCapabilities> {
  const features = getFeatures(device)
  const capabilities: DiscoveredHidppCapabilities = {}

  if (await features.hasFeature(HIDPP_PAGE.ONBOARD_PROFILES)) {
    const description = await logitechGetProfilesDescription(device)

    let dpiMin = 100
    let dpiMax = 25600
    let dpiStep = 50

    if (await features.hasFeature(HIDPP_PAGE.ADJUSTABLE_DPI)) {
      try {
        const dpiInfo = await logitechGetDpiInfo(device)
        dpiMin = dpiInfo.dpiMin
        dpiMax = dpiInfo.dpiMax
        dpiStep = dpiInfo.dpiStep || 50
      } catch {
        // Use defaults
      }
    }

    const hasGShift = (description.mechanicalLayout & 0x03) === 0x02
    const hasDpiShift = ((description.mechanicalLayout >> 2) & 0x03) === 0x02

    const { description: desc, activeProfileIndex, profiles } = await logitechGetAllProfiles(device)
    const profileData: HidppProfileData = {
      description: desc,
      activeProfileIndex,
      profiles: profiles.map((p) => ({
        sector: p.sector,
        name: p.name,
        reportRateMs: p.reportRateMs,
        dpiStages: p.dpiStages,
        activeDpiIndex: p.defaultDpiIndex,
        dpiShiftIndex: p.dpiShiftIndex,
        dirty: false,
      })),
    }

    capabilities.profile = new HidppProfileCapability(
      device,
      {
        profileCount: description.profileCount,
        dpiMin,
        dpiMax,
        dpiStep,
        maxDpiStages: ONBOARD_PROFILE.MAX_DPI_STAGES,
        hasGShift,
        hasDpiShift,
      },
      profileData,
    )

    capabilities.dpi = new HidppDerivedDpiCapability(device, capabilities.profile, {
      minDpi: dpiMin,
      maxDpi: dpiMax,
      step: dpiStep,
    })

    // Create derived polling capability if device supports it
    if (await features.hasFeature(HIDPP_PAGE.ADJUSTABLE_REPORT_RATE)) {
      const pollingInfo = await logitechGetPollingRateInfo(device)
      capabilities.polling = new HidppDerivedPollingCapability(device, capabilities.profile, {
        supportedIntervals: pollingInfo.supportedRates,
      })
    }
  }

  const batteryFeatures = [HIDPP_PAGE.BATTERY_LEVEL_STATUS, HIDPP_PAGE.UNIFIED_BATTERY, HIDPP_PAGE.BATTERY_VOLTAGE]

  for (const batteryFeature of batteryFeatures) {
    if (await features.hasFeature(batteryFeature)) {
      const battery = await logitechGetBatteryLevel(device)
      capabilities.chargeLevel = new HidppChargeLevelCapability(device, { percentage: battery.level })
      break
    }
  }

  return capabilities
}
