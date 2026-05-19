import type { Device } from '@/lib/device/device'
import { buildDeathadderV3ProWirelessMock, buildGProXSuperlight2Mock } from './devices'

export { buildDeathadderV3ProWirelessMock, buildGProXSuperlight2Mock }

type MockFlag = {
  envKey: string
  build: () => Device
}

const FLAGS: MockFlag[] = [
  { envKey: 'VITE_MOCK_DEATHADDER_V3_PRO', build: buildDeathadderV3ProWirelessMock },
  { envKey: 'VITE_MOCK_GPRO_SUPERLIGHT2', build: buildGProXSuperlight2Mock }
]

const isTruthyFlag = (value: unknown): boolean => {
  if (value === true) return true
  if (typeof value !== 'string') return false
  const v = value.trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes' || v === 'on'
}

/**
 * Returns the set of mock devices the current build was configured to
 * inject, derived from `VITE_MOCK_*` env flags resolved at build time by
 * Vite. Returns an empty array in production builds where no flags are set.
 */
export function getEnabledMockDevices(): Device[] {
  const env = import.meta.env as Record<string, unknown> | undefined
  if (!env) return []
  return FLAGS.filter((f) => isTruthyFlag(env[f.envKey])).map((f) => f.build())
}
