import { createContext, useContext } from 'react'
import { DeviceStore } from './deviceStore'

class RootStore {
  deviceStore: DeviceStore
  constructor() {
    this.deviceStore = new DeviceStore()
  }
}

const rootStore = new RootStore()

export const StoreContext = createContext(rootStore)
export const StoreProvider = ({ children }: { children: React.ReactNode }) => (
  <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
)

export const useStore = () => useContext(StoreContext)
