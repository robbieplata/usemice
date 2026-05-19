import type { HidSession } from '../hid.ts'
import { getFeatures } from './features.ts'
import { CMD_ONBOARD_PROFILES, HIDPP_PAGE, ONBOARD_PROFILE, REPORT_RATE_MS_TO_HZ } from './constants.ts'
import { crcCcitt, getBE16, getLE16, HidppNotSupportedError, setBE16, setLE16 } from './hidppReport.ts'

const CMD_BATTERY_LEVEL_STATUS_GET = 0x00

export type LogitechBatteryInfo = {
  level: number // 0-100
  nextLevel: number // next level threshold
  status: number // charging status
}

export async function logitechGetBatteryLevel(device: HidSession): Promise<LogitechBatteryInfo> {
  const features = getFeatures(device)

  if (await features.hasFeature(HIDPP_PAGE.BATTERY_LEVEL_STATUS)) {
    const response = await features.featureRequest(HIDPP_PAGE.BATTERY_LEVEL_STATUS, CMD_BATTERY_LEVEL_STATUS_GET)
    return {
      level: response.getParameter(0),
      nextLevel: response.getParameter(1),
      status: response.getParameter(2),
    }
  }

  if (await features.hasFeature(HIDPP_PAGE.UNIFIED_BATTERY)) {
    const response = await features.featureRequest(HIDPP_PAGE.UNIFIED_BATTERY, 0x00)
    return {
      level: response.getParameter(0),
      nextLevel: 0,
      status: response.getParameter(2),
    }
  }

  if (await features.hasFeature(HIDPP_PAGE.BATTERY_VOLTAGE)) {
    const response = await features.featureRequest(HIDPP_PAGE.BATTERY_VOLTAGE, 0x00)
    const voltage = response.getParameterBE16(0)
    // 3.3V = 0%, 4.2V = 100%
    const percentage = Math.min(100, Math.max(0, ((voltage - 3300) / 900) * 100))
    return {
      level: Math.round(percentage),
      nextLevel: 0,
      status: response.getParameter(2),
    }
  }

  throw new HidppNotSupportedError(HIDPP_PAGE.BATTERY_LEVEL_STATUS)
}

const CMD_ADJUSTABLE_DPI_GET_SENSOR_COUNT = 0x00
const CMD_ADJUSTABLE_DPI_GET_SENSOR_DPI_LIST = 0x01
const CMD_ADJUSTABLE_DPI_GET_SENSOR_DPI = 0x02
const CMD_ADJUSTABLE_DPI_SET_SENSOR_DPI = 0x03

export type LogitechDpiInfo = {
  sensorCount: number
  dpiList: number[]
  dpiMin: number
  dpiMax: number
  dpiStep: number
}

export type LogitechDpiValue = {
  sensorIndex: number
  dpi: number
  defaultDpi: number
}

export async function logitechGetDpiInfo(device: HidSession): Promise<LogitechDpiInfo> {
  const features = getFeatures(device)

  if (!(await features.hasFeature(HIDPP_PAGE.ADJUSTABLE_DPI))) {
    throw new HidppNotSupportedError(HIDPP_PAGE.ADJUSTABLE_DPI)
  }

  const countResponse = await features.featureRequest(HIDPP_PAGE.ADJUSTABLE_DPI, CMD_ADJUSTABLE_DPI_GET_SENSOR_COUNT)
  const sensorCount = countResponse.getParameter(0)

  const params = new Uint8Array([0]) // sensor index 0
  const listResponse = await features.featureRequest(
    HIDPP_PAGE.ADJUSTABLE_DPI,
    CMD_ADJUSTABLE_DPI_GET_SENSOR_DPI_LIST,
    params,
  )

  const dpiList: number[] = []
  let dpiMin = 0
  let dpiMax = 0
  let dpiStep = 0

  // If first value is 0xE001, it's a range (min, max, step)
  const firstValue = listResponse.getParameterBE16(0)
  if ((firstValue & 0xe000) === 0xe000) {
    // Range format: 0xE001 means DPI range follows
    dpiMin = listResponse.getParameterBE16(2)
    dpiMax = listResponse.getParameterBE16(4)
    dpiStep = listResponse.getParameterBE16(6) || 50 // default step
  } else {
    // each 16-bit value is a supported DPI
    for (let i = 0; i < 7; i++) {
      const dpi = listResponse.getParameterBE16(i * 2)
      if (dpi === 0) break
      dpiList.push(dpi)
    }
    if (dpiList.length > 0) {
      dpiMin = Math.min(...dpiList)
      dpiMax = Math.max(...dpiList)
    }
  }

  return { sensorCount, dpiList, dpiMin, dpiMax, dpiStep }
}

export async function logitechGetDpi(device: HidSession, sensorIndex = 0): Promise<LogitechDpiValue> {
  const features = getFeatures(device)

  if (!(await features.hasFeature(HIDPP_PAGE.ADJUSTABLE_DPI))) {
    throw new HidppNotSupportedError(HIDPP_PAGE.ADJUSTABLE_DPI)
  }

  const params = new Uint8Array([sensorIndex])
  const response = await features.featureRequest(HIDPP_PAGE.ADJUSTABLE_DPI, CMD_ADJUSTABLE_DPI_GET_SENSOR_DPI, params)

  return {
    sensorIndex: response.getParameter(0),
    dpi: response.getParameterBE16(1),
    defaultDpi: response.getParameterBE16(3),
  }
}

export async function logitechSetDpi(device: HidSession, dpi: number, sensorIndex = 0): Promise<void> {
  const features = getFeatures(device)

  if (!(await features.hasFeature(HIDPP_PAGE.ADJUSTABLE_DPI))) {
    throw new HidppNotSupportedError(HIDPP_PAGE.ADJUSTABLE_DPI)
  }

  const params = new Uint8Array(3)
  params[0] = sensorIndex
  setBE16(params, 1, dpi)

  await features.featureRequest(HIDPP_PAGE.ADJUSTABLE_DPI, CMD_ADJUSTABLE_DPI_SET_SENSOR_DPI, params)
}

const CMD_REPORT_RATE_GET_LIST = 0x00
const CMD_REPORT_RATE_GET = 0x01
const CMD_REPORT_RATE_SET = 0x02

export type LogitechPollingInfo = {
  supportedRates: number[] // in Hz
}

export async function logitechGetPollingRateInfo(device: HidSession): Promise<LogitechPollingInfo> {
  const features = getFeatures(device)

  if (!(await features.hasFeature(HIDPP_PAGE.ADJUSTABLE_REPORT_RATE))) {
    throw new HidppNotSupportedError(HIDPP_PAGE.ADJUSTABLE_REPORT_RATE)
  }

  const response = await features.featureRequest(HIDPP_PAGE.ADJUSTABLE_REPORT_RATE, CMD_REPORT_RATE_GET_LIST)
  const bitflags = response.getParameter(0)

  const supportedRates: number[] = []
  for (const [flag, hz] of Object.entries(REPORT_RATE_MS_TO_HZ)) {
    if (bitflags & Number(flag)) {
      supportedRates.push(hz)
    }
  }
  supportedRates.sort((a, b) => b - a)
  return { supportedRates }
}

export async function logitechGetPollingRate(device: HidSession): Promise<number> {
  const features = getFeatures(device)
  if (!(await features.hasFeature(HIDPP_PAGE.ADJUSTABLE_REPORT_RATE))) {
    throw new HidppNotSupportedError(HIDPP_PAGE.ADJUSTABLE_REPORT_RATE)
  }
  const response = await features.featureRequest(HIDPP_PAGE.ADJUSTABLE_REPORT_RATE, CMD_REPORT_RATE_GET)
  const rateMs = response.getParameter(0) // rate in ms (1ms = 1000Hz)
  // ms to Hz
  return rateMs > 0 ? Math.round(1000 / rateMs) : 1000
}

export async function logitechSetPollingRate(device: HidSession, rateHz: number): Promise<void> {
  const features = getFeatures(device)
  if (!(await features.hasFeature(HIDPP_PAGE.ADJUSTABLE_REPORT_RATE))) {
    throw new HidppNotSupportedError(HIDPP_PAGE.ADJUSTABLE_REPORT_RATE)
  }
  // Hz to ms
  const rateMs = Math.round(1000 / rateHz)
  const params = new Uint8Array([rateMs])
  await features.featureRequest(HIDPP_PAGE.ADJUSTABLE_REPORT_RATE, CMD_REPORT_RATE_SET, params)
}

const CMD_DEVICE_INFO_GET = 0x00
const CMD_DEVICE_NAME_GET_LENGTH = 0x00
const CMD_DEVICE_NAME_GET_PART = 0x01

export type LogitechDeviceInfo = {
  entityCount: number
  unitId: number[]
  transport: number[]
  modelId: number[]
}

export async function getDeviceInfo(device: HidSession): Promise<LogitechDeviceInfo> {
  const features = getFeatures(device)

  if (!(await features.hasFeature(HIDPP_PAGE.DEVICE_INFO))) {
    throw new HidppNotSupportedError(HIDPP_PAGE.DEVICE_INFO)
  }

  const response = await features.featureRequest(HIDPP_PAGE.DEVICE_INFO, CMD_DEVICE_INFO_GET)

  return {
    entityCount: response.getParameter(0),
    unitId: Array.from(response.parameters.slice(1, 5)),
    transport: Array.from(response.parameters.slice(5, 8)),
    modelId: Array.from(response.parameters.slice(8, 14)),
  }
}

export async function logitechGetDeviceName(device: HidSession): Promise<string> {
  const features = getFeatures(device)

  if (!(await features.hasFeature(HIDPP_PAGE.DEVICE_NAME))) {
    throw new HidppNotSupportedError(HIDPP_PAGE.DEVICE_NAME)
  }

  const lengthResponse = await features.featureRequest(HIDPP_PAGE.DEVICE_NAME, CMD_DEVICE_NAME_GET_LENGTH)
  const nameLength = lengthResponse.getParameter(0)

  let name = ''
  for (let offset = 0; offset < nameLength; offset += 16) {
    const params = new Uint8Array([offset])
    const response = await features.featureRequest(HIDPP_PAGE.DEVICE_NAME, CMD_DEVICE_NAME_GET_PART, params)

    const partLength = Math.min(16, nameLength - offset)
    for (let i = 0; i < partLength; i++) {
      const char = response.getParameter(i)
      if (char === 0) break
      name += String.fromCharCode(char)
    }
  }

  return name
}

export type OnboardProfilesDescription = {
  memoryModel: number
  profileFormat: number
  macroFormat: number
  profileCount: number
  profileCountOOB: number // Out-Of-Box / ROM profiles
  buttonCount: number
  sectorCount: number
  sectorSize: number
  mechanicalLayout: number // bits 0-1: g-shift, bits 2-3: dpi-shift
  variousInfo: number
}

export type OnboardProfileData = {
  reportRateMs: number
  defaultDpiIndex: number
  dpiShiftIndex: number
  dpiStages: number[] // up to 5 DPI values
  name: string
}

export async function logitechGetProfilesDescription(device: HidSession): Promise<OnboardProfilesDescription> {
  const features = getFeatures(device)

  if (!(await features.hasFeature(HIDPP_PAGE.ONBOARD_PROFILES))) {
    throw new HidppNotSupportedError(HIDPP_PAGE.ONBOARD_PROFILES)
  }

  const response = await features.featureRequest(HIDPP_PAGE.ONBOARD_PROFILES, CMD_ONBOARD_PROFILES.GET_DESCRIPTION)

  return {
    memoryModel: response.getParameter(0),
    profileFormat: response.getParameter(1),
    macroFormat: response.getParameter(2),
    profileCount: response.getParameter(3),
    profileCountOOB: response.getParameter(4),
    buttonCount: response.getParameter(5),
    sectorCount: response.getParameter(6),
    sectorSize: response.getParameterBE16(7),
    mechanicalLayout: response.getParameter(9),
    variousInfo: response.getParameter(10),
  }
}

export async function logitechGetActiveProfile(device: HidSession): Promise<number> {
  const features = getFeatures(device)

  if (!(await features.hasFeature(HIDPP_PAGE.ONBOARD_PROFILES))) {
    throw new HidppNotSupportedError(HIDPP_PAGE.ONBOARD_PROFILES)
  }

  const response = await features.featureRequest(HIDPP_PAGE.ONBOARD_PROFILES, CMD_ONBOARD_PROFILES.GET_CURRENT_PROFILE)
  // 2 bytes: sector address of current profile
  return response.getParameterBE16(0)
}

export async function logitechSetActiveProfile(device: HidSession, profileSector: number): Promise<void> {
  const features = getFeatures(device)

  if (!(await features.hasFeature(HIDPP_PAGE.ONBOARD_PROFILES))) {
    throw new HidppNotSupportedError(HIDPP_PAGE.ONBOARD_PROFILES)
  }

  const params = new Uint8Array(2)
  setBE16(params, 0, profileSector)
  await features.featureRequest(HIDPP_PAGE.ONBOARD_PROFILES, CMD_ONBOARD_PROFILES.SET_CURRENT_PROFILE, params)
}

async function readProfileMemory(device: HidSession, sector: number, offset: number): Promise<Uint8Array> {
  const features = getFeatures(device)
  // Memory read sends 4 parameter bytes (sector BE16 + offset BE16); a short
  // request only carries 3 parameter bytes so the offset's low byte would be
  // silently truncated. Must use the long-request variant.
  const params = new Uint8Array(4)
  setBE16(params, 0, sector)
  setBE16(params, 2, offset)

  const response = await features.featureRequestLong(
    HIDPP_PAGE.ONBOARD_PROFILES,
    CMD_ONBOARD_PROFILES.MEMORY_READ,
    params,
  )
  return response.parameters
}

/**
 * Offset 0: report_rate (1 byte)
 * Offset 1: resolution_default_index (1 byte)
 * Offset 2: resolution_shift_index (1 byte)
 * Offset 3-12: resolutions[5] (5 x 2 bytes, little-endian)
 * ...other fields
 * Offset 160-207: name (48 bytes, UTF-16LE, 24 chars max)
 */
function parseProfileData(data: Uint8Array): OnboardProfileData {
  const reportRateMs = data[0] || 1
  const defaultDpiIndex = data[1]
  const dpiShiftIndex = data[2]
  // Read 5 DPI stages (little-endian 16-bit values)
  const dpiStages: number[] = []
  for (let i = 0; i < ONBOARD_PROFILE.MAX_DPI_STAGES; i++) {
    const dpi = getLE16(data, 3 + i * 2)
    if (dpi > 0 && dpi < 0xffff) {
      dpiStages.push(dpi)
    }
  }
  // Read profile name at offset 160 (UTF-16LE, 48 bytes or 24 chars)
  let name = ''
  const nameOffset = 160
  for (let i = 0; i < ONBOARD_PROFILE.PROFILE_NAME_LENGTH; i++) {
    const charCode = getLE16(data, nameOffset + i * 2)
    if (charCode === 0 || charCode === 0xffff) break
    name += String.fromCharCode(charCode)
  }

  return {
    reportRateMs,
    defaultDpiIndex,
    dpiShiftIndex,
    dpiStages,
    name: name.trim() || `Profile`,
  }
}

export async function logitechReadProfile(
  device: HidSession,
  sector: number,
  sectorSize: number,
): Promise<OnboardProfileData> {
  const data = new Uint8Array(sectorSize)
  let offset = 0

  while (offset < sectorSize) {
    const chunk = await readProfileMemory(device, sector, offset)
    // Copy up to 16 bytes (memory read returns 16 bytes per call)
    const copyLen = Math.min(16, sectorSize - offset)
    data.set(chunk.slice(0, copyLen), offset)
    offset += 16
  }

  return parseProfileData(data)
}

export async function logitechReadProfileSector(
  device: HidSession,
  sector: number,
  sectorSize: number,
): Promise<Uint8Array> {
  const data = new Uint8Array(sectorSize)
  let offset = 0

  while (offset < sectorSize) {
    const chunk = await readProfileMemory(device, sector, offset)
    const copyLen = Math.min(16, sectorSize - offset)
    data.set(chunk.slice(0, copyLen), offset)
    offset += 16
  }

  return data
}

async function writeProfileMemoryStart(
  device: HidSession,
  sector: number,
  offset: number,
  count: number,
): Promise<void> {
  const features = getFeatures(device)
  // 6 parameter bytes; needs the long-request variant for the same reason as MEMORY_READ.
  const params = new Uint8Array(6)
  setBE16(params, 0, sector)
  setBE16(params, 2, offset)
  setBE16(params, 4, count)

  await features.featureRequestLong(HIDPP_PAGE.ONBOARD_PROFILES, CMD_ONBOARD_PROFILES.MEMORY_ADDR_WRITE, params)
}

async function writeProfileMemoryData(device: HidSession, data: Uint8Array): Promise<void> {
  const features = getFeatures(device)
  // 16 parameter bytes; only the long variant fits.
  const params = new Uint8Array(16)
  params.set(data.slice(0, 16))
  await features.featureRequestLong(HIDPP_PAGE.ONBOARD_PROFILES, CMD_ONBOARD_PROFILES.MEMORY_WRITE, params)
}

async function writeProfileMemoryEnd(device: HidSession): Promise<void> {
  const features = getFeatures(device)
  await features.featureRequest(HIDPP_PAGE.ONBOARD_PROFILES, CMD_ONBOARD_PROFILES.MEMORY_WRITE_END)
}

export async function logitechWriteProfileSector(
  device: HidSession,
  sector: number,
  data: Uint8Array,
  writeCrc: boolean = true,
): Promise<void> {
  const sectorSize = data.length

  if (writeCrc) {
    const crc = crcCcitt(data, sectorSize - 2)
    setBE16(data, sectorSize - 2, crc)
  }

  await writeProfileMemoryStart(device, sector, 0, sectorSize)
  for (let offset = 0; offset < sectorSize; offset += 16) {
    const chunk = data.slice(offset, offset + 16)
    await writeProfileMemoryData(device, chunk)
  }
  await writeProfileMemoryEnd(device)
}

export async function logitechWriteProfile(
  device: HidSession,
  sector: number,
  sectorSize: number,
  profile: OnboardProfileData,
): Promise<void> {
  const data = await logitechReadProfileSector(device, sector, sectorSize)

  data[0] = Math.max(1, Math.round(1000 / Math.max(1, profile.reportRateMs)))
  data[1] = profile.defaultDpiIndex & 0xff
  data[2] = profile.dpiShiftIndex & 0xff

  for (let i = 0; i < ONBOARD_PROFILE.MAX_DPI_STAGES; i++) {
    const dpi = i < profile.dpiStages.length ? profile.dpiStages[i] : 0
    setLE16(data, 3 + i * 2, dpi)
  }

  const nameOffset = 160
  // Clear name area first
  for (let i = 0; i < ONBOARD_PROFILE.PROFILE_NAME_LENGTH * 2; i++) {
    data[nameOffset + i] = 0xff
  }
  const maxNameLen = Math.min(profile.name.length, ONBOARD_PROFILE.PROFILE_NAME_LENGTH)
  for (let i = 0; i < maxNameLen; i++) {
    setLE16(data, nameOffset + i * 2, profile.name.charCodeAt(i))
  }
  // Null
  if (maxNameLen < ONBOARD_PROFILE.PROFILE_NAME_LENGTH) {
    setLE16(data, nameOffset + maxNameLen * 2, 0)
  }
  await logitechWriteProfileSector(device, sector, data, true)
}

export async function logitechWriteProfileDirectory(
  device: HidSession,
  sectorSize: number,
  profiles: { sector: number; enabled: boolean }[],
): Promise<void> {
  const data = new Uint8Array(sectorSize)
  data.fill(0xff)

  let offset = 0
  for (const profile of profiles) {
    setBE16(data, offset, profile.sector)
    data[offset + 2] = profile.enabled ? 0x01 : 0x00
    data[offset + 3] = 0x00
    offset += 4
  }

  setBE16(data, offset, 0xffff)

  await logitechWriteProfileSector(device, 0x0000, data, true)
}

//Commit all profiles to flash. writes each enabled profile and updates the directory
export async function logitechCommitProfiles(
  device: HidSession,
  description: OnboardProfilesDescription,
  profiles: (OnboardProfileData & { sector: number; enabled?: boolean })[],
): Promise<void> {
  // Write each profile
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i]
    await logitechWriteProfile(device, profile.sector, description.sectorSize, profile)
  }

  // Write the profile directory
  const directory = profiles.map((p) => ({
    sector: p.sector,
    enabled: p.enabled ?? true,
  }))
  await logitechWriteProfileDirectory(device, description.sectorSize, directory)
}

async function getProfileHeaders(
  device: HidSession,
  sectorSize: number,
): Promise<{ sector: number; enabled: boolean }[]> {
  const headers: { sector: number; enabled: boolean }[] = []
  // Try RAM (sector 0x0000) first; if blank, fall back to ROM (sector 0x0001).
  let sectorBase = 0x0000
  let chunk = await readProfileMemory(device, sectorBase, 0)
  if (
    (chunk[0] === 0 && chunk[1] === 0 && chunk[2] === 0 && chunk[3] === 0) ||
    (chunk[0] === 0xff && chunk[1] === 0xff && chunk[2] === 0xff && chunk[3] === 0xff)
  ) {
    sectorBase = 0x0001
    chunk = await readProfileMemory(device, sectorBase, 0)
  }

  // Each directory entry is 4 bytes: [sectorBE16, enabled, pad]; iterate until
  // we hit the 0xFFFF end marker. Memory_read returns 16-byte chunks, so for
  // devices with >4 profiles we page through additional chunks.
  let chunkBase = 0
  while (chunkBase < sectorSize) {
    for (let offset = 0; offset + 4 <= chunk.length; offset += 4) {
      const sector = getBE16(chunk, offset)
      if (sector === 0xffff) return headers
      headers.push({ sector, enabled: chunk[offset + 2] !== 0 })
    }
    chunkBase += chunk.length
    if (chunkBase >= sectorSize) break
    chunk = await readProfileMemory(device, sectorBase, chunkBase)
  }

  return headers
}

export async function logitechGetAllProfiles(device: HidSession): Promise<{
  description: OnboardProfilesDescription
  activeProfileIndex: number
  profiles: (OnboardProfileData & { sector: number })[]
}> {
  const description = await logitechGetProfilesDescription(device)
  const activeProfileSector = await logitechGetActiveProfile(device)
  const headers = await getProfileHeaders(device, description.sectorSize)

  const profiles: (OnboardProfileData & { sector: number })[] = []
  let activeProfileIndex = 0

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]
    const profileData = await logitechReadProfile(device, header.sector, description.sectorSize)
    profiles.push({
      ...profileData,
      sector: header.sector,
      name: profileData.name || `Profile ${i + 1}`,
    })

    if (header.sector === activeProfileSector) {
      activeProfileIndex = i
    }
  }
  return { description, activeProfileIndex, profiles }
}
