import { useEffect, useState } from 'react'
import { type HidppDevice, type Ready } from '../../../lib/device.ts'
import { Button } from '../../ui/button.tsx'
import { Card } from '../../ui/card.tsx'
import { Slider } from '../../ui/slider.tsx'
import { observer } from 'mobx-react-lite'
import { Target } from 'lucide-react'

type DpiStagesProps = {
  device: Ready<HidppDevice<'profile' | 'dpi'>>
}

export const DpiStages = observer(({ device }: DpiStagesProps) => {
  const profileCap = device.capabilities.profile
  const dpi = device.capabilities.dpi
  const active = profileCap.activeProfile
  const { dpiMin, dpiMax, dpiStep, maxDpiStages } = profileCap.info
  const [localDpiStages, setLocalDpiStages] = useState(() => active.dpiStages)

  useEffect(() => {
    setLocalDpiStages(active.dpiStages)
  }, [active.dpiStages])

  return (
    <section>
      <Card size='sm' className='space-y-4 p-4'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-primary/10 p-2'>
            <Target className='size-4 text-primary' />
          </div>
          <h3 className='text-sm font-medium'>DPI Stages</h3>
          <span className='ml-auto text-xs text-muted-foreground'>
            Active stage:{' '}
            <span className='font-semibold text-foreground'>
              {active.dpiStages[active.activeDpiIndex] ?? active.dpiStages[0] ?? '-'} DPI
            </span>
          </span>
        </div>

        {localDpiStages.slice(0, maxDpiStages).map((dpiValue, i) => {
          const isActive = i === active.activeDpiIndex
          return (
            <div key={i} className='flex items-center gap-3'>
              <Button
                variant={isActive ? 'default' : 'outline'}
                className='min-w-20'
                onClick={() => dpi.setActiveDpiIndex(i)}
              >
                Stage {i + 1}
              </Button>
              <div className='text-sm w-20 text-center'>
                <span className='font-medium tabular-nums'>{dpiValue}</span> DPI
              </div>
              <div className='flex-1'>
                <Slider
                  min={dpiMin}
                  max={dpiMax}
                  step={dpiStep || 50}
                  value={[dpiValue]}
                  onValueChange={(values) => {
                    setLocalDpiStages((stages) => stages.map((stage, idx) => (idx === i ? values[0] : stage)))
                  }}
                  onValueCommit={(values) => dpi.setDpiStage(i, values[0])}
                />
              </div>
            </div>
          )
        })}
      </Card>
    </section>
  )
})
