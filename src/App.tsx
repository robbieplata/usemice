import { observer } from 'mobx-react-lite'
import { flowResult } from 'mobx'
import './App.css'
import DeviceView from './components/DeviceView'
import { useStore } from './stores'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Skeleton } from './components/ui/skeleton'
import { Badge } from './components/ui/badge'

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

  return (
    <div className='mx-auto w-full space-y-4 p-4'>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-16'>
        <Card className='lg:col-span-4'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base'>Devices</CardTitle>
          </CardHeader>

          <CardContent className='space-y-4'>
            {devices.map((device) => {
              const isSelected = selectedDevice?.id === device.id

              return (
                <button
                  key={device.id}
                  type='button'
                  onClick={() => setSelectedDeviceId(device.id)}
                  className={[
                    'w-full rounded-xl border p-4 text-left transition',
                    'hover focus:outline-none focus:ring-zinc-500',
                    'cursor-pointer',
                    isSelected ? 'border-zinc-500' : ''
                  ].join(' ')}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-semibold'>{device.hid.productName}</div>
                      <div className='mt-1 text-xs'>
                        ID: <span className='font-mono'>{device.id}</span>
                      </div>
                    </div>

                    <div className='flex flex-shrink-0 flex-col items-end'>
                      <Badge variant='outline'>{device.status}</Badge>
                    </div>
                  </div>
                </button>
              )
            })}

            <div className='rounded-xl border border-dashed p-4 text-sm cursor-pointer' onClick={connect}>
              <div className='flex items-center gap-4'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-[200px]' />
                  <Skeleton className='h-4 w-[150px]' />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='lg:col-span-8'>
          <CardContent className='min-h-[85vh]'>
            {!selectedDevice ? (
              <>
                <div className='space-y-2'>
                  <Skeleton className='h-6 w-2/3 max-w-[360px]' />
                </div>

                <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <Skeleton className='h-[72px] w-full rounded-xl border' />
                  <Skeleton className='h-[72px] w-full rounded-xl border' />
                  <Skeleton className='h-[72px] w-full rounded-xl border' />
                  <Skeleton className='h-[72px] w-full rounded-xl border' />
                </div>

                <div className='mt-6 space-y-6'>
                  {[1, 2, 3, 4].map((section) => (
                    <section key={section} className='space-y-3'>
                      <div className='rounded-xl border p-3 space-y-3'>
                        <Skeleton className='h-4 w-32' />
                        <Skeleton className='h-4 w-full' />
                        <Skeleton className='h-4 w-5/6' />
                        <Skeleton className='h-4 w-2/3' />
                      </div>
                    </section>
                  ))}
                </div>
              </>
            ) : (
              <DeviceView device={selectedDevice} />
            )}
          </CardContent>
        </Card>

        <Card className='lg:col-span-4'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base'>Errors</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='rounded-xl border border-dashed p-4 text-sm cursor-pointer'>
              <div className='flex items-center gap-4'>
                <div className='space-y-2'>
                  <Skeleton className='h-2 w-[200px]' />
                  <Skeleton className='h-2 w-[200px]' />
                  <Skeleton className='h-2 w-[150px]' />
                  <Skeleton className='h-2 w-[150px]' />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

export default App
