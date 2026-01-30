import { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash/debounce'
import type { ReadyDeviceWithCapabilities } from '@/lib/device/device'
import { Slider } from '../ui/slider'
import { Card } from '../ui/card'
import { Clock } from 'lucide-react'
import { observer } from 'mobx-react-lite'

type IdleTimeProps = {
  device: ReadyDeviceWithCapabilities<'idleTime'>
}

type IdleTimeInnerProps = {
  device: ReadyDeviceWithCapabilities<'idleTime'>
  initialSeconds: number
}

const IdleTimeInner = observer(({ device, initialSeconds }: IdleTimeInnerProps) => {
  const [seconds, setSeconds] = useState(initialSeconds)

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
            <div className='rounded-lg bg-primary/10 p-2'>
              <Clock className='size-4 text-primary' />
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
})

// Use key to reset internal state when device seconds change externally
export const IdleTime = ({ device }: IdleTimeProps) => {
  const deviceSeconds = device.capabilities.idleTime.data.seconds
  return <IdleTimeInner key={deviceSeconds} device={device} initialSeconds={deviceSeconds} />
}
