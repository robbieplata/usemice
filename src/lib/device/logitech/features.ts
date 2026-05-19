import type { HidSession } from '@/lib/device/hid'
import { HidppReport, HidppNotSupportedError, hidpp20Request, hidpp20RequestLong, setBE16 } from './hidppReport'
import { HIDPP_PAGE, HIDPP_PAGE_ROOT_IDX } from './constants'

const CMD_ROOT_GET_FEATURE = 0x00
const CMD_ROOT_GET_PROTOCOL_VERSION = 0x01

const CMD_FEATURE_SET_GET_COUNT = 0x00
const CMD_FEATURE_SET_GET_FEATURE_ID = 0x01

export type ProtocolVersion = {
  major: number
  minor: number
}

export type FeatureInfo = {
  featurePage: number
  featureIndex: number
  featureType: number
  featureVersion: number
}

export class HidppFeatures {
  private device: HidSession
  private featureCache = new Map<number, number>() // featurePage -> featureIndex
  private protocolVersion: ProtocolVersion | null = null
  private featureList: FeatureInfo[] = []
  private initialized = false

  constructor(device: HidSession) {
    this.device = device
  }

  //Get protocol version (HID++ 1.0 or 2.0)
  async getProtocolVersion(): Promise<ProtocolVersion> {
    if (this.protocolVersion) {
      return this.protocolVersion
    }

    const msg = hidpp20Request(HIDPP_PAGE_ROOT_IDX, CMD_ROOT_GET_PROTOCOL_VERSION)

    try {
      const response = await msg.send(this.device)
      this.protocolVersion = {
        major: response.getParameter(0),
        minor: response.getParameter(1)
      }
    } catch (e) {
      // If we get INVALID_SUBID, the device is HID++ 1.0
      if (e instanceof Error && e.message.includes('Invalid sub ID')) {
        this.protocolVersion = { major: 1, minor: 0 }
      } else {
        throw e
      }
    }

    return this.protocolVersion
  }

  async isHidpp20(): Promise<boolean> {
    const version = await this.getProtocolVersion()
    return version.major >= 2
  }

  /**
   * feature index for a given feature page.
   * cached index if available, otherwise queries the device.
   * 0 if the feature is not supported.
   */
  async getFeatureIndex(featurePage: number): Promise<number> {
    // Root is always at index 0
    if (featurePage === HIDPP_PAGE.ROOT) {
      return HIDPP_PAGE_ROOT_IDX
    }

    const cached = this.featureCache.get(featurePage)
    if (cached !== undefined) {
      return cached
    }

    const params = new Uint8Array(2)
    setBE16(params, 0, featurePage)

    const msg = hidpp20Request(HIDPP_PAGE_ROOT_IDX, CMD_ROOT_GET_FEATURE, params)

    try {
      const response = await msg.send(this.device)
      const featureIndex = response.getParameter(0)
      const featureType = response.getParameter(1)
      const featureVersion = response.getParameter(2)

      this.featureCache.set(featurePage, featureIndex)

      if (featureIndex !== 0) {
        this.featureList.push({
          featurePage,
          featureIndex,
          featureType,
          featureVersion
        })
      }

      return featureIndex
    } catch (e) {
      if (e instanceof HidppNotSupportedError) {
        this.featureCache.set(featurePage, 0)
        return 0
      }
      throw e
    }
  }

  async hasFeature(featurePage: number): Promise<boolean> {
    const index = await this.getFeatureIndex(featurePage)
    return index !== 0
  }

  async getAllFeatures(): Promise<FeatureInfo[]> {
    if (this.initialized) {
      return this.featureList
    }

    const featureSetIndex = await this.getFeatureIndex(HIDPP_PAGE.FEATURE_SET)
    if (featureSetIndex === 0) {
      this.initialized = true
      return this.featureList
    }

    const countMsg = hidpp20Request(featureSetIndex, CMD_FEATURE_SET_GET_COUNT)
    const countResponse = await countMsg.send(this.device)
    const featureCount = countResponse.getParameter(0)

    for (let i = 1; i <= featureCount; i++) {
      const params = new Uint8Array([i])
      const msg = hidpp20Request(featureSetIndex, CMD_FEATURE_SET_GET_FEATURE_ID, params)

      try {
        const response = await msg.send(this.device)
        const featurePage = response.getParameterBE16(0)
        const featureType = response.getParameter(2)

        if (featurePage !== 0) {
          // Cache this feature
          this.featureCache.set(featurePage, i)
          this.featureList.push({
            featurePage,
            featureIndex: i,
            featureType,
            featureVersion: 0
          })
        }
      } catch {
        continue // ignore features that error
      }
    }

    this.initialized = true
    return this.featureList
  }

  async featureRequest(featurePage: number, functionId: number, parameters?: Uint8Array): Promise<HidppReport> {
    const featureIndex = await this.getFeatureIndex(featurePage)
    if (featureIndex === 0) {
      throw new HidppNotSupportedError(featurePage)
    }

    const msg = hidpp20Request(featureIndex, functionId, parameters)
    return msg.send(this.device)
  }

  async featureRequestLong(featurePage: number, functionId: number, parameters?: Uint8Array): Promise<HidppReport> {
    const featureIndex = await this.getFeatureIndex(featurePage)
    if (featureIndex === 0) {
      throw new HidppNotSupportedError(featurePage)
    }
    const msg = hidpp20RequestLong(featureIndex, functionId, parameters)
    return msg.send(this.device)
  }

  // clear feature cache like on device reconnect
  clearCache(): void {
    this.featureCache.clear()
    this.featureList = []
    this.protocolVersion = null
    this.initialized = false
  }
}

// Singleton cache for HidppFeatures per device
const featuresCache = new WeakMap<HidSession, HidppFeatures>()

export function getFeatures(device: HidSession): HidppFeatures {
  let features = featuresCache.get(device)
  if (!features) {
    features = new HidppFeatures(device)
    featuresCache.set(device, features)
  }
  return features
}
