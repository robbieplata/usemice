import { createContext, useContext, useEffect, useMemo } from 'react'
import { DeviceStore } from './deviceStore'

class RootStore {
  deviceStore: DeviceStore
  constructor() {
    this.deviceStore = new DeviceStore()
  }

  init() {
    this.deviceStore.init()
  }

  dispose() {
    this.deviceStore.dispose()
  }
}

export const StoreContext = createContext<RootStore | null>(null)
export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const rootStore = useMemo(() => new RootStore(), [])
  useEffect(() => {
    rootStore.init()
    return () => rootStore.dispose()
  }, [rootStore])
  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used within StoreProvider')
  return store
}
