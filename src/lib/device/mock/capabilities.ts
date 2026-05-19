import { action } from 'mobx'
import {
  RazerDpiCapability,
  RazerDpiStagesCapability,
  RazerPollingCapability,
  RazerChargeLevelCapability,
  RazerChargeStatusCapability,
  RazerIdleTimeCapability,
  RazerFirmwareVersionCapability,
  RazerSerialCapability,
  RazerDongleLedCapability,
  RazerDongleLedMultiCapability,
  type IRazerDeviceCore,
  type RazerDpiStagesData
} from '@/lib/device/razer/capabilities'
import {
  HidppProfileCapability,
  HidppDerivedDpiCapability,
  HidppDerivedPollingCapability,
  HidppChargeLevelCapability,
  type IHidppDeviceCore,
  type HidppProfileData
} from '@/lib/device/logitech/capabilities'

export class MockRazerDpiCapability extends RazerDpiCapability {
  constructor(device: IRazerDeviceCore, info: RazerDpiCapability['info'], initial: { x: number; y: number }) {
    super(device, info)
    this.data = initial
  }
  @action
  override async refresh(): Promise<void> {}
  override async set(value: { x: number; y: number }): Promise<void> {
    this.data = value
  }
}

export class MockRazerDpiStagesCapability extends RazerDpiStagesCapability {
  constructor(device: IRazerDeviceCore, info: RazerDpiStagesCapability['info'], initial: RazerDpiStagesData) {
    super(device, info)
    this.data = initial
  }
  @action
  override async refresh(): Promise<void> {}
  override async set(value: RazerDpiStagesData): Promise<void> {
    if (value.dpiLevels.length < 1) throw new Error('At least one DPI stage must be provided')
    if (value.dpiLevels.length > this.info.maxStages) {
      throw new Error(`Too many DPI stages (${value.dpiLevels.length}), maximum is ${this.info.maxStages}`)
    }
    this.data = value
  }
}

export class MockRazerPollingCapability extends RazerPollingCapability {
  constructor(device: IRazerDeviceCore, info: RazerPollingCapability['info'], initial: { interval: number }) {
    super(device, info)
    this.data = initial
  }
  @action
  override async refresh(): Promise<void> {}
  override async set(value: { interval: number }): Promise<void> {
    this.data = value
  }
}

export class MockRazerChargeLevelCapability extends RazerChargeLevelCapability {
  constructor(device: IRazerDeviceCore, info: RazerChargeLevelCapability['info'], initial: { percentage: number }) {
    super(device, info)
    this.data = initial
  }
  @action
  override async refresh(): Promise<void> {}
}

export class MockRazerChargeStatusCapability extends RazerChargeStatusCapability {
  constructor(device: IRazerDeviceCore, info: RazerChargeStatusCapability['info'], initial: { status: boolean }) {
    super(device, info)
    this.data = initial
  }
  @action
  override async refresh(): Promise<void> {}
}

export class MockRazerIdleTimeCapability extends RazerIdleTimeCapability {
  constructor(device: IRazerDeviceCore, info: RazerIdleTimeCapability['info'], initial: { seconds: number }) {
    super(device, info)
    this.data = initial
  }
  @action
  override async refresh(): Promise<void> {}
  override async set(value: { seconds: number }): Promise<void> {
    if (value.seconds < this.info.minSeconds || value.seconds > this.info.maxSeconds) {
      throw new Error(`Idle time must be between ${this.info.minSeconds} and ${this.info.maxSeconds} seconds`)
    }
    this.data = value
  }
}

export class MockRazerFirmwareVersionCapability extends RazerFirmwareVersionCapability {
  constructor(
    device: IRazerDeviceCore,
    info: RazerFirmwareVersionCapability['info'],
    initial: { major: number; minor: number }
  ) {
    super(device, info)
    this.data = initial
  }
  @action
  override async refresh(): Promise<void> {}
}

export class MockRazerSerialCapability extends RazerSerialCapability {
  constructor(device: IRazerDeviceCore, info: RazerSerialCapability['info'], initial: { serialNumber: string }) {
    super(device, info)
    this.data = initial
  }
  @action
  override async refresh(): Promise<void> {}
}

export class MockRazerDongleLedCapability extends RazerDongleLedCapability {
  constructor(device: IRazerDeviceCore, info: RazerDongleLedCapability['info'], initial: { mode: number }) {
    super(device, info)
    this.data = initial
  }
  @action
  override async refresh(): Promise<void> {}
  override async set(value: { mode: number }): Promise<void> {
    this.data = value
  }
}

export class MockRazerDongleLedMultiCapability extends RazerDongleLedMultiCapability {
  constructor(
    device: IRazerDeviceCore,
    info: RazerDongleLedMultiCapability['info'],
    initial: { modes: [number, number, number] }
  ) {
    super(device, info)
    this.data = initial
  }
  @action
  override async refresh(): Promise<void> {}
  override async set(value: { modes: [number, number, number] }): Promise<void> {
    this.data = value
  }
}

export class MockHidppProfileCapability extends HidppProfileCapability {
  @action
  override async refresh(): Promise<void> {}

  @action
  override async set(value: HidppProfileData): Promise<void> {
    this.data = { ...value, profiles: value.profiles.map((p) => ({ ...p, dirty: false })) }
  }

  @action
  override async switchTo(index: number): Promise<void> {
    if (index < 0 || index >= this.data.profiles.length) {
      throw new Error(`Invalid profile index: ${index}`)
    }
    this.data = { ...this.data, activeProfileIndex: index }
  }

  @action
  override async saveAll(): Promise<void> {
    this.data = {
      ...this.data,
      profiles: this.data.profiles.map((p) => ({ ...p, dirty: false }))
    }
  }
}

export class MockHidppDerivedDpiCapability extends HidppDerivedDpiCapability {
  private readonly mockProfile: HidppProfileCapability

  constructor(
    device: IHidppDeviceCore,
    profileCap: HidppProfileCapability,
    info: HidppDerivedDpiCapability['info']
  ) {
    super(device, profileCap, info)
    this.mockProfile = profileCap
  }

  override async set(value: { x: number; y: number }): Promise<void> {
    this.mockProfile.updateActiveProfile((p) => {
      if (p.activeDpiIndex >= p.dpiStages.length) return p
      const dpiStages = [...p.dpiStages]
      dpiStages[p.activeDpiIndex] = value.x
      return { ...p, dpiStages, dirty: true }
    })
  }

  override async setDpiStage(stageIndex: number, value: number): Promise<void> {
    this.mockProfile.updateActiveProfile((p) => {
      if (stageIndex < 0 || stageIndex >= p.dpiStages.length) return p
      const dpiStages = [...p.dpiStages]
      dpiStages[stageIndex] = value
      return { ...p, dpiStages, dirty: true }
    })
  }

  override async setActiveDpiIndex(index: number): Promise<void> {
    const active = this.mockProfile.activeProfile
    if (index < 0 || index >= active.dpiStages.length) {
      throw new Error(`Invalid DPI stage index: ${index}`)
    }
    this.mockProfile.updateActiveProfile((p) => ({ ...p, activeDpiIndex: index, dirty: true }))
  }
}

export class MockHidppDerivedPollingCapability extends HidppDerivedPollingCapability {
  private readonly mockProfile: HidppProfileCapability

  constructor(
    device: IHidppDeviceCore,
    profileCap: HidppProfileCapability,
    info: HidppDerivedPollingCapability['info']
  ) {
    super(device, profileCap, info)
    this.mockProfile = profileCap
  }

  override async set(value: { interval: number }): Promise<void> {
    const reportRateMs = Math.max(1, Math.round(1000 / Math.max(1, value.interval)))
    this.mockProfile.updateActiveProfile((p) => ({ ...p, reportRateMs, dirty: true }))
  }
}

export class MockHidppChargeLevelCapability extends HidppChargeLevelCapability {
  @action
  override async refresh(): Promise<void> {}
}
