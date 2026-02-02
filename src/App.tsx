import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import Device from './components/Device'
import { useStore } from './stores'
import { PollingChart } from './components/PollingChart'
import { ScrollWheelTester } from './components/ScrollWheelTester'
import { Header } from './components/Header'

const App = observer(() => {
  const {
    deviceStore: { selectedDevice }
  } = useStore()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const pageTitle =
    selectedDevice !== undefined ? `${selectedDevice.hid.productName} - usemice` : 'Mouse Configuration Tool - usemice'

  useEffect(() => {
    document.title = pageTitle
  }, [pageTitle])

  return (
    <div className='mx-auto w-full space-y-4 p-4'>
      <Header drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
        <Device device={selectedDevice} onOpenSidebar={() => setDrawerOpen(true)} />
        <div className='xl:col-span-5 flex flex-col gap-4 h-[90vh]'>
          <PollingChart className='flex-1 min-h-0' />
          <ScrollWheelTester className='flex-1 min-h-0' />
        </div>
      </div>
    </div>
  )
})

export default App
