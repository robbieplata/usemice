import type { ReadyDeviceWithCapabilities } from '@/lib/device/device'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { observer } from 'mobx-react-lite'

type Polling2Props = {
  device: ReadyDeviceWithCapabilities<'polling2'>
}

export const Polling2 = observer(({ device }: Polling2Props) => (
  <section className='space-y-2'>
    <div className='flex items-center justify-between rounded-xl border p-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold'>Polling rate</h3>
      </div>
      <p className='text-sm'>
        Current: <span className='font-medium tabular-nums'>{device.capabilities.polling2.data.interval}</span> Hz
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>{device.capabilities.polling2.data.interval} Hz</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-36'>
          {device.capabilities.polling2.info.supportedIntervals.map((interval) => (
            <DropdownMenuItem
              key={interval}
              onClick={() => device.set('polling2', { interval })}
              className='flex items-center justify-between'
            >
              <span className='tabular-nums'>{interval} Hz</span>
              {interval === device.capabilities.polling2.data.interval && <span className='text-xs'>Current</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </section>
))
