import { observer } from 'mobx-react-lite'
import { flowResult } from 'mobx'
import { useStore } from '../stores'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Menu, Unplug } from 'lucide-react'
import { Skeleton } from './ui/skeleton'

interface DevicesSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const DevicesSidebar = observer(({ open, onOpenChange }: DevicesSidebarProps) => {
  const {
    deviceStore: { addDevice, requestDevice, selectedDevice, devices, setSelectedDeviceId, removeDevice }
  } = useStore()

  const connect = async () => {
    const requestResult = await flowResult(requestDevice())
    if (!requestResult.error) {
      const deviceResult = await flowResult(addDevice(requestResult.value))
      if (!deviceResult.error && selectedDevice === undefined) {
        onOpenChange(false)
      }
    } else {
      console.error('Failed to request device:', requestResult.error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
                    if (devices.length <= 1) onOpenChange(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedDeviceId(device.id)
                      if (devices.length <= 1) onOpenChange(false)
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
                      <Badge variant={device.status === 'Failed' ? 'destructive' : 'outline'}>{device.status}</Badge>
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
                    <svg className='w-5 h-5 text-primary/60' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
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
  )
})
