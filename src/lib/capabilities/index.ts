import type { DpiData } from "./dpi"
import type { PollingData } from "./polling"

export type UnknownCapabilities = {
    dpi?: boolean
    polling?: boolean
}

export type CapabilityData = {
    dpi?: DpiData
    polling?: PollingData
}