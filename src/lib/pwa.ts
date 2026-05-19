export function isInstalled(): boolean {
  if ((globalThis.navigator as Navigator & { standalone?: boolean }).standalone === true) return true

  const displayModes = ['standalone', 'minimal-ui', 'fullscreen'] as const
  return displayModes.some((mode) => globalThis.matchMedia(`(display-mode: ${mode})`).matches)
}

export function getPageTitle(deviceName: string | undefined): string {
  return deviceName ?? 'usemice'
}
