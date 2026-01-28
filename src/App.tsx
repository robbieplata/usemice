import { observer } from 'mobx-react-lite'
import { flowResult } from 'mobx'
import './App.css'
import DeviceView from './components/DeviceView'
import { useStore } from './stores'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Skeleton } from './components/ui/skeleton'
import { Badge } from './components/ui/badge'
import { ScrollArea } from './components/ui/scroll-area'

const App = observer(() => {
  const {
    deviceStore: { addDevice, requestDevice, selectedDevice, devices, setSelectedDeviceId }
  } = useStore()

  const connect = async () => {
    const requestResult = await flowResult(requestDevice())
    if (!requestResult.error) {
      const deviceResult = await flowResult(addDevice(requestResult.value))
      if (!deviceResult.error) {
        setSelectedDeviceId(deviceResult.value.id)
      }
    } else {
      console.error('Failed to request device:', requestResult.error)
    }
  }

  const errors = selectedDevice?.commandErrors || []

  return (
    <div className='mx-auto w-full space-y-4 p-4'>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-16'>
        <Card className='lg:col-span-4 h-[85vh] overflow-hidden flex flex-col'>
          <CardHeader className='pb-2 shrink-0'>
            <CardTitle className='text-base'>Devices</CardTitle>
          </CardHeader>

          <CardContent className='flex-1 min-h-0 p-0'>
            <ScrollArea className='h-full'>
              <div className='space-y-4 p-6'>
                {devices.map((device) => {
                  const isSelected = selectedDevice?.id === device.id

                  return (
                    <button
                      key={device.id}
                      type='button'
                      onClick={() => setSelectedDeviceId(device.id)}
                      className={[
                        'w-full rounded-xl border p-4 text-left transition',
                        'hover focus:outline-none focus:ring-neutral-500',
                        'cursor-pointer',
                        isSelected ? 'border-neutral-500' : ''
                      ].join(' ')}
                    >
                      <div className='flex items-start justify-between gap-3 min-w-0'>
                        <div className='flex-1 min-w-0 w-0'>
                          <div className='truncate text-sm font-semibold'>{device.hid.productName}</div>
                          <div className='truncate mt-1 text-xs'>
                            ID: <span className='font-mono'>{device.id}</span>
                          </div>
                        </div>

                        <div className='shrink-0 flex flex-col items-end'>
                          <Badge variant='outline'>{device.status}</Badge>
                        </div>
                      </div>
                    </button>
                  )
                })}

                <div
                  className='rounded-xl border border-dashed p-4 text-sm cursor-pointer hover:border-neutral-600 transition'
                  onClick={connect}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') connect()
                  }}
                >
                  <div className='flex items-center gap-4'>
                    <div className='shrink-0'>
                      <div className='w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center'>
                        <svg className='w-5 h-5 text-neutral-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                        </svg>
                      </div>
                    </div>
                    <div className='space-y-2 w-full'>
                      <Skeleton className='h-4 w-full max-w-[200px]' />
                      <Skeleton className='h-4 w-full max-w-[150px]' />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className='lg:col-span-8 h-[85vh] overflow-hidden flex flex-col'>
          <CardContent className='flex-1 min-h-0'>
            <ScrollArea className='h-full'>
              <DeviceView device={selectedDevice} />
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className='lg:col-span-4 h-[85vh] overflow-hidden flex flex-col'>
          <CardHeader className='pb-2 shrink-0'>
            <CardTitle className='text-base'>Errors</CardTitle>
          </CardHeader>

          <CardContent className='flex-1 min-h-0 p-0'>
            <ScrollArea className='h-full'>
              <div className='space-y-3 p-6'>
                {errors.length > 0 ? (
                  errors.map((error, index) => (
                    <div key={index} className='rounded-lg border  p-4'>
                      <div className='text-xs mb-1'>{new Date(error._timestamp).toLocaleTimeString()}</div>
                      <div className='font-medium text-sm'>{error.name}</div>
                      <div className='text-sm mt-1'>{error.message}</div>
                    </div>
                  ))
                ) : (
                  <div className='rounded-lg border-2 border-dashed p-6 text-center text-sm text-neutral-500'>
                    No errors
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

export default App
