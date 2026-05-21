import { Clipboard, ClipboardPaste } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { toast } from 'sonner'
import { type HidppDevice, type Ready } from '../../../lib/device.ts'
import { decodeProfileShareText, encodeProfileShareText } from '../../../lib/profileShareText.ts'
import { Button } from '../../ui/button.tsx'
import { Card } from '../../ui/card.tsx'

type ProfileImportExportProps = {
  device: Ready<HidppDevice<'profile'>>
}

export const ProfileImportExport = observer(({ device }: ProfileImportExportProps) => {
  const profileCap = device.capabilities.profile

  const copyProfiles = async () => {
    await navigator.clipboard.writeText(encodeProfileShareText('logitech', device.hid, profileCap.exportBinary()))
  }

  const pasteProfiles = async () => {
    const text = await navigator.clipboard.readText()
    profileCap.importBinary(decodeProfileShareText('logitech', device.hid, text))
  }

  return (
    <section>
      <Card size='sm' className='p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-sm font-medium'>Profile Sharing</h3>
            <p className='text-xs text-muted-foreground'>Copy or paste all onboard profiles.</p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                toast.promise(copyProfiles(), {
                  loading: 'Copying profile share text...',
                  success: 'Profile share text copied',
                  error: (error) =>
                    `Failed to copy profile share text: ${error instanceof Error ? error.message : String(error)}`,
                })}
              title='Copy profile share text'
            >
              <Clipboard className='size-3.5' />
              <span className='ml-1.5'>Copy</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                toast.promise(pasteProfiles(), {
                  loading: 'Pasting profile share text...',
                  success: 'Profile share text imported. Save changes to write them to the device.',
                  error: (error) =>
                    `Failed to paste profile share text: ${error instanceof Error ? error.message : String(error)}`,
                })}
              title='Paste profile share text'
            >
              <ClipboardPaste className='size-3.5' />
              <span className='ml-1.5'>Paste</span>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  )
})
