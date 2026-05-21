import { type HidppDevice, type Ready } from '../../../lib/device.ts'
import { Button } from '../../ui/button.tsx'
import { Card } from '../../ui/card.tsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu.tsx'
import { observer } from 'mobx-react-lite'
import { Layers, Save } from 'lucide-react'

type ProfileProps = {
  device: Ready<HidppDevice<'profile'>>
}

export const Profile = observer(({ device }: ProfileProps) => {
  const profileCap = device.capabilities.profile
  const { activeProfileIndex, profiles } = profileCap.data
  const active = profileCap.activeProfile

  return (
    <section>
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
    </section>
  )
})
