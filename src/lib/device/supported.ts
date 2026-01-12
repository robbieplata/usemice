import type { CapabilityKey } from '../device/device'
import { DeviceBuilder, type DeviceDefinition } from './builder'
import { dpiAdapter } from '../capabilities/dpi'
import { polling2Adapter } from '../capabilities/polling2'
import { serialAdapter } from '../capabilities/serial'

const DeathAdderV4Pro = DeviceBuilder.create('Razer DeathAdder V4 Pro Wired', 0x1532, 0x00be)
  .with(serialAdapter())
  .with(dpiAdapter({ minDpi: 100, maxDpi: 45_000, maxStages: 5 }))
  .with(polling2Adapter({ supportedIntervals: [125, 250, 500, 1000, 2000, 4000, 8000] }))

const DEATHADDER_V4_PRO_WIRED = DeathAdderV4Pro.build()
const DEATHADDER_V4_PRO_WIRELESS = DeathAdderV4Pro.variant('Razer DeathAdder V4 Pro Wireless', 0x00bf)

export const SUPPORTED_DEVICE_INFO: Set<DeviceDefinition<CapabilityKey>> = new Set([
  DEATHADDER_V4_PRO_WIRED,
  DEATHADDER_V4_PRO_WIRELESS
])
