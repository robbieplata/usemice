import { observer } from 'mobx-react-lite'
import { flowResult } from 'mobx'
import { useState } from 'react'
import DeviceView from './components/DeviceView'
import { MouseTools } from './components/MouseTools'
import { useStore } from './stores'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Skeleton } from './components/ui/skeleton'
import { Badge } from './components/ui/badge'
import { ScrollArea } from './components/ui/scroll-area'
import { ThemeToggle } from './components/ThemeToggle'
import { Button } from './components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet'
import { Menu, AlertCircle, Unplug } from 'lucide-react'

const App = observer(() => {
  const {
    deviceStore: { addDevice, requestDevice, selectedDevice, devices, setSelectedDeviceId, removeDevice }
  } = useStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [errorsDrawerOpen, setErrorsDrawerOpen] = useState(false)

  const connect = async () => {
    const requestResult = await flowResult(requestDevice())
    if (!requestResult.error) {
      const deviceResult = await flowResult(addDevice(requestResult.value))
      if (!deviceResult.error && selectedDevice === undefined) {
        setSelectedDeviceId(deviceResult.value.id)
        setDrawerOpen(false)
      }
    } else {
      console.error('Failed to request device:', requestResult.error)
    }
  }

  const errors = selectedDevice?.commandErrors || []

  return (
    <div className='mx-auto w-full space-y-4 p-4'>
      <header className='flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm'>
        <div className='flex items-center gap-3'>
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='size-9'>
                <Menu className='size-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-80 p-0' aria-describedby={undefined}>
              <SheetHeader className='px-4'>
                <SheetTitle className='text-base'>Devices</SheetTitle>
              </SheetHeader>
              <ScrollArea className='h-[calc(100vh-4rem)]'>
                <div className='space-y-4 p-4 pr-6'>
                  {devices.map((device) => {
                    const isSelected = selectedDevice?.id === device.id

                    return (
                      <div
                        key={device.id}
                        role='button'
                        tabIndex={0}
                        onClick={() => {
                          setSelectedDeviceId(device.id)
                          if (devices.length <= 1) setDrawerOpen(false)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedDeviceId(device.id)
                            if (devices.length <= 1) setDrawerOpen(false)
                          }
                        }}
                        className={[
                          'w-full rounded-xl border p-4 text-left transition-all',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'bg-card border-border hover:bg-accent cursor-pointer'
                        ].join(' ')}
                      >
                        <div className='flex items-start justify-between gap-3 min-w-0'>
                          <div className='flex-1 min-w-0 w-0'>
                            <div className={`truncate text-sm font-semibold ${isSelected ? 'text-primary' : ''}`}>
                              {device.hid.productName}
                            </div>
                            <div className='truncate mt-1 text-xs text-muted-foreground'>
                              ID: <span className='font-mono'>{device.id}</span>
                            </div>
                          </div>

                          <div className='shrink-0 flex flex-col items-end gap-2'>
                            <Badge variant={device.status === 'Failed' ? 'destructive' : 'outline'}>
                              {device.status}
                            </Badge>
                            <Button
                              variant='ghost'
                              size='icon-xs'
                              onClick={(e) => {
                                e.stopPropagation()
                                flowResult(removeDevice(device, true))
                              }}
                              aria-label='Disconnect device'
                            >
                              <Unplug className='size-4' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  <div
                    className='rounded-xl border border-dashed border-primary/30 p-4 text-sm cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition'
                    onClick={connect}
                    role='button'
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') connect()
                    }}
                  >
                    <div className='flex items-center gap-4'>
                      <div className='shrink-0'>
                        <div className='w-10 h-10 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center'>
                          <svg
                            className='w-5 h-5 text-primary/60'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                          </svg>
                        </div>
                      </div>
                      <div className='space-y-2 w-full'>
                        <p className='text-sm font-medium text-primary/80'>Add Device</p>
                        <Skeleton className='h-3 w-full max-w-[150px]' />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <div className='h-6 w-px bg-border' />
          <span className='font-semibold text-lg tracking-tight'>usemice</span>
        </div>
        <div className='flex items-center gap-1'>
          <Sheet open={errorsDrawerOpen} onOpenChange={setErrorsDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className={`size-9 relative ${errors.length > 0 ? 'text-destructive' : ''}`}
              >
                <AlertCircle className='size-5' />
                {errors.length > 0 && (
                  <span className='absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground'>
                    {errors.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-96 p-0' aria-describedby={undefined}>
              <SheetHeader className='px-4'>
                <SheetTitle className='text-base'>Errors</SheetTitle>
              </SheetHeader>
              <ScrollArea className='h-[calc(100vh-4rem)]'>
                <div className='space-y-3 p-4 pr-6'>
                  {errors.length > 0 ? (
                    errors.map((error, index) => (
                      <div key={index} className='rounded-xl border border-destructive/30 bg-destructive/5 p-4'>
                        <div className='flex items-center justify-between'>
                          <div className='text-xs font-medium text-destructive'>{error.name}</div>
                          <div className='text-xs text-muted-foreground'>
                            {new Date(error._timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className='text-sm mt-2'>{error.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className='flex flex-col items-center justify-center py-16 text-center'>
                      <p className='mt-3 text-sm font-medium'>All Clear</p>
                      <p className='mt-1 text-xs text-muted-foreground'>No errors to report</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <Button variant='ghost' size='icon' className='size-9' asChild>
            <a
              href='https://github.com/robbieplata/usemice'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub repository'
            >
              <svg className='size-5' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
              </svg>
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
        <Card className='xl:col-span-7 h-[90vh] overflow-hidden flex flex-col'>
          <CardContent className='flex-1 min-h-0 pr-0'>
            <ScrollArea className='h-full'>
              <div className='pr-3 min-h-full'>
                <DeviceView device={selectedDevice} onOpenSidebar={() => setDrawerOpen(true)} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className='xl:col-span-5 h-[90vh] overflow-hidden flex flex-col'>
          <CardHeader className='shrink-0'>
            <CardTitle className='text-base'>Tools</CardTitle>
          </CardHeader>
          <CardContent className='flex-1 min-h-0 p-0'>
            <ScrollArea className='h-full'>
              <MouseTools />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

export default App
