import { Clipboard, ClipboardPaste, Layers } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { toast } from 'sonner'
import { type RazerDevice, type Ready } from '../../../lib/device.ts'
import { decodeProfileShareText, encodeProfileShareText } from '../../../lib/profileShareText.ts'
import { exportRazerSettingsProfile, importRazerSettingsProfile } from '../../../lib/razer/index.ts'
import { Button } from '../../ui/button.tsx'
import { Card } from '../../ui/card.tsx'

type SettingsImportExportProps = {
  device: Ready<RazerDevice>
}

export const SettingsImportExport = observer(({ device }: SettingsImportExportProps) => {
  const copyProfile = async () => {
    await navigator.clipboard.writeText(
      encodeProfileShareText('razer', device.hid, exportRazerSettingsProfile(device.capabilities)),
    )
  }

  const pasteProfile = async () => {
    const text = await navigator.clipboard.readText()
    await importRazerSettingsProfile(device.capabilities, decodeProfileShareText('razer', device.hid, text))
  }

  return (
    <section>
      <Card size='sm' className='space-y-4 p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-primary/10 p-2'>
              <Layers className='size-4 text-primary' />
            </div>
            <div>
              <h3 className='text-sm font-medium'>Settings Sharing</h3>
              <p className='text-xs text-muted-foreground'>Copy or paste writable Razer settings.</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                toast.promise(copyProfile(), {
                  loading: 'Copying Razer settings share text...',
                  success: 'Razer settings share text copied',
                  error: (error) =>
                    `Failed to copy Razer settings share text: ${
                      error instanceof Error ? error.message : String(error)
                    }`,
                })}
              title='Copy settings share text'
            >
              <Clipboard className='size-3.5' />
              <span className='ml-1.5'>Copy</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                toast.promise(pasteProfile(), {
                  loading: 'Pasting Razer settings share text...',
                  success: 'Razer settings share text imported',
                  error: (error) =>
                    `Failed to paste Razer settings share text: ${
                      error instanceof Error ? error.message : String(error)
                    }`,
                })}
              title='Paste settings share text'
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
