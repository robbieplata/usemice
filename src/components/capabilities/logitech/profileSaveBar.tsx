import { type HidppDevice, type Ready } from '../../../lib/device.ts'
import { Button } from '../../ui/button.tsx'
import { observer } from 'mobx-react-lite'
import { Save } from 'lucide-react'
import { toast } from 'sonner'

type ProfileSaveBarProps = {
  device: Ready<HidppDevice<'profile'>>
}

export const ProfileSaveBar = observer(({ device }: ProfileSaveBarProps) => {
  const profileCap = device.capabilities.profile

  if (!profileCap.hasDirtyProfiles) {
    return null
  }

  const saveProfiles = () => {
    toast.promise(profileCap.saveAll(), {
      loading: 'Saving profile changes...',
      success: 'Profile changes saved',
      error: (error) => `Failed to save profile changes: ${error instanceof Error ? error.message : String(error)}`,
    })
  }

  return (
    <div className='sticky bottom-4 z-10 mt-6 flex justify-center pointer-events-none'>
      <div className='flex items-center gap-3 rounded-md border border-border/70 bg-popover/95 py-2 pl-4 pr-2 backdrop-blur-sm pointer-events-auto'>
        <span className='text-sm font-medium text-popover-foreground'>Unsaved profile changes</span>
        <Button size='sm' variant='default' onClick={saveProfiles} title='Save changes to device flash'>
          <Save className='size-3.5' />
          <span className='ml-1.5'>Save</span>
        </Button>
      </div>
    </div>
  )
})
