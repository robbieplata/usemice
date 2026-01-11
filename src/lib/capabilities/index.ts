import { Effect } from 'effect'
import type { Device, UnknownCapabilities } from '../device/device'
import { init_dpi } from './dpi'
import { init_polling2 } from './polling2'
import { init_serial } from './serial'

export const capabilityInitializers: {
  [K in keyof UnknownCapabilities]: (device: Device) => Effect.Effect<Device, Error>
} = {
  dpi: init_dpi,
  polling2: init_polling2,
  serial: init_serial
}
