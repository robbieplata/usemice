import { polling } from '@/lib/capabilities'
import type { ReadyDeviceWithCapabilities } from '@/lib/device/device'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu'
import { Button } from '../ui/button'
import { observer } from 'mobx-react-lite'

type PollingProps = {
  device: ReadyDeviceWithCapabilities<'polling'>
}

export const Polling = observer(({ device }: PollingProps) => (
  <section className='space-y-2'>
    <div className='flex items-center justify-between rounded-xl border p-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold'>Polling rate</h3>
      </div>
      <p className='text-sm'>
        Current: <span className='font-medium tabular-nums'>{device.capabilities.polling.data.interval}</span> Hz
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>{device.capabilities.polling.data.interval} Hz</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-36'>
          {device.capabilities.polling.info.supportedIntervals.map((interval) => (
            <DropdownMenuItem
              key={interval}
              onClick={() => polling.set(device, { interval })}
              className='flex items-center justify-between'
            >
              <span className='tabular-nums'>{interval} Hz</span>
              {interval === device.capabilities.polling.data.interval && <span className='text-xs'>Current</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </section>
))
