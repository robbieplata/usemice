import { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash/debounce'
import type { ReadyDeviceWithCapabilities } from '@/lib/device/device'
import { Slider } from '../ui/slider'
import { Card } from '../ui/card'
import { Clock } from 'lucide-react'

type IdleTimeProps = {
  device: ReadyDeviceWithCapabilities<'idleTime'>
}

export const IdleTime = ({ device }: IdleTimeProps) => {
  const [seconds, setSeconds] = useState(device.capabilities.idleTime.data.seconds)

  useEffect(() => {
    setSeconds(device.capabilities.idleTime.data.seconds)
  }, [device.capabilities.idleTime.data.seconds])

  const debouncedUpdateIdleTime = useMemo(
    () =>
      debounce((value: number) => {
        device.set('idleTime', { seconds: value })
      }, 300),
    [device]
  )

  useEffect(() => {
    return () => {
      debouncedUpdateIdleTime.cancel()
    }
  }, [debouncedUpdateIdleTime])

  const onValueChange = ([value]: number[]) => {
    setSeconds(value)
    debouncedUpdateIdleTime(value)
  }

  return (
    <section>
      <Card size='sm' className='p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-muted p-2'>
              <Clock className='size-4 text-muted-foreground' />
            </div>
            <h3 className='text-sm font-medium'>Idle Time</h3>
          </div>
          <span className='text-lg font-semibold tabular-nums'>{seconds}s</span>
        </div>

        <div className='mt-4'>
          <Slider
            step={1}
            min={device.capabilities.idleTime.info.minSeconds}
            max={device.capabilities.idleTime.info.maxSeconds}
            value={[seconds]}
            onValueChange={onValueChange}
          />
          <div className='mt-2 flex justify-between text-xs text-muted-foreground'>
            <span>{device.capabilities.idleTime.info.minSeconds}s</span>
            <span>{device.capabilities.idleTime.info.maxSeconds}s</span>
          </div>
        </div>
      </Card>
    </section>
  )
}
