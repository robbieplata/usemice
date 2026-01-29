import type { ReadyDeviceWithCapabilities } from '@/lib/device/device'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { observer } from 'mobx-react-lite'
import { Gauge } from 'lucide-react'

type PollingProps = {
  device: ReadyDeviceWithCapabilities<'polling'>
}

export const Polling = observer(({ device }: PollingProps) => (
  <section>
    <Card size='sm' className='p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-muted p-2'>
            <Gauge className='size-4 text-muted-foreground' />
          </div>
          <h3 className='text-sm font-medium'>Polling Rate</h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='min-w-24'>
              <span className='tabular-nums'>{device.capabilities.polling.data.interval}</span> Hz
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='min-w-36'>
            {device.capabilities.polling.info.supportedIntervals.map((interval) => (
              <DropdownMenuItem
                key={interval}
                onClick={() => device.set('polling', { interval })}
                className='flex items-center justify-between'
              >
                <span className='tabular-nums'>{interval} Hz</span>
                {interval === device.capabilities.polling.data.interval && (
                  <span className='text-xs text-muted-foreground'>Current</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  </section>
))
