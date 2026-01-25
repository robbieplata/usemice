import { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash/debounce'

import { idleTime } from '@/lib/capabilities'
import type { ReadyDeviceWithCapabilities } from '@/lib/device/device'
import { Slider } from '../ui/slider'

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
        idleTime.set(device, { seconds: value })
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
    <section className='space-y-2'>
      <div className='rounded-xl border p-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-semibold'>Idle time</h3>
          <span className='text-sm tabular-nums'>{seconds}s</span>
        </div>

        <Slider
          className='mt-4'
          step={1}
          min={device.capabilities.idleTime.info.minSeconds}
          max={device.capabilities.idleTime.info.maxSeconds}
          value={[seconds]}
          onValueChange={onValueChange}
        />

        <div className='mt-2 flex justify-between text-xs'>
          <span>{device.capabilities.idleTime.info.minSeconds}s</span>
          <span>{device.capabilities.idleTime.info.maxSeconds}s</span>
        </div>
      </div>
    </section>
  )
}
