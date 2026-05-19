import { useCallback, useEffect, useState } from 'react'
import { isInstalled } from '@/lib/pwa.ts'

export function usePwaInstall() {
  const [canShow, setCanShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const hideIfInstalled = () => {
      if (isInstalled()) setCanShow(false)
    }

    hideIfInstalled()

    const onAppInstalled = () => setCanShow(false)
    globalThis.addEventListener('appinstalled', onAppInstalled)

    const displayQuery = globalThis.matchMedia('(display-mode: standalone)')
    displayQuery.addEventListener('change', hideIfInstalled)

    return () => {
      globalThis.removeEventListener('appinstalled', onAppInstalled)
      displayQuery.removeEventListener('change', hideIfInstalled)
    }
  }, [])

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      if (isInstalled()) return
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setCanShow(true)
    }

    globalThis.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => globalThis.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') setCanShow(false)
  }, [deferredPrompt])

  return { canShow, install }
}
