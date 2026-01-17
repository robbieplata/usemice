import { createContext, useContext } from 'react'
import { DeviceStore } from './deviceStore'
import { UIStore } from './uiStore'

class RootStore {
  deviceStore: DeviceStore
  uiStore: UIStore
  constructor() {
    this.deviceStore = new DeviceStore()
    this.uiStore = new UIStore()
  }
}

const rootStore = new RootStore()

export const StoreContext = createContext(rootStore)
export const StoreProvider = ({ children }: { children: React.ReactNode }) => (
  <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
)

export const useStore = () => useContext(StoreContext)
