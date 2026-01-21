import { createContext, useContext, useEffect, useMemo } from 'react'
import { DeviceStore } from './deviceStore'

class RootStore {
  deviceStore: DeviceStore
  constructor() {
    this.deviceStore = new DeviceStore()
  }

  dispose() {
    console.log('Disposing RootStore and its stores')
    this.deviceStore.dispose()
  }
}

export const StoreContext = createContext<RootStore | null>(null)
export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const rootStore = useMemo(() => new RootStore(), [])
  useEffect(() => {
    return () => {
      if (!import.meta.env.DEV) {
        rootStore.dispose()
      }
    }
  }, [])
  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used within StoreProvider')
  return store
}
