import { type HidppDevice, type Ready } from '@/lib/device/device'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Slider } from '../ui/slider'
import { observer } from 'mobx-react-lite'
import { Save, Target, Layers } from 'lucide-react'

type Props = {
  device: Ready<HidppDevice<'profile' | 'dpi'>>
}


export const HidppProfile = observer(({ device }: Props) => {
  const profileCap = device.capabilities.profile
  const dpi = device.capabilities.dpi
  const { activeProfileIndex, profiles } = profileCap.data
  const active = profileCap.activeProfile
  const { dpiMin, dpiMax, dpiStep, maxDpiStages } = profileCap.info

  return (
    <section className='space-y-3'>
      <Card size='sm' className='space-y-4 p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-primary/10 p-2'>
              <Layers className='size-4 text-primary' />
            </div>
            <h3 className='text-sm font-medium'>Profile</h3>
          </div>
          <div className='flex items-center gap-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='min-w-32'>
                  {active.name || `Profile ${activeProfileIndex + 1}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='min-w-40'>
                {profiles.map((profile, idx) => (
                  <DropdownMenuItem
                    key={profile.sector}
                    onClick={() => profileCap.switchTo(idx)}
                    className='flex items-center justify-between'
                  >
                    <span>{profile.name || `Profile ${idx + 1}`}</span>
                    {idx === activeProfileIndex && <span className='text-xs text-muted-foreground'>Active</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size='sm'
              variant='default'
              onClick={() => profileCap.saveAll()}
              disabled={!profileCap.hasDirtyProfiles}
              title={profileCap.hasDirtyProfiles ? 'Save changes to device flash' : 'No pending changes'}
            >
              <Save className='size-3.5' />
              <span className='ml-1.5'>Save</span>
            </Button>
          </div>
        </div>
      </Card>

      <Card size='sm' className='space-y-4 p-4'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-primary/10 p-2'>
            <Target className='size-4 text-primary' />
          </div>
          <h3 className='text-sm font-medium'>DPI Stages</h3>
          <span className='ml-auto text-xs text-muted-foreground'>
            Active stage:{' '}
            <span className='font-semibold text-foreground'>
              {active.dpiStages[active.activeDpiIndex] ?? active.dpiStages[0] ?? '—'} DPI
            </span>
          </span>
        </div>

        {active.dpiStages.slice(0, maxDpiStages).map((dpiValue, i) => {
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
