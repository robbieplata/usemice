import { Cpu } from 'lucide-react'
import { Card } from '../ui/card.tsx'
import { type RazerDevice, type Ready } from '../../lib/device.ts'
import { observer } from 'mobx-react-lite'

type FirmwareVersionProps = {
  device: Ready<RazerDevice<'firmwareVersion'>>
}

export const FirmwareVersion = observer(({ device }: FirmwareVersionProps) => {
  return (
    <Card size='sm' className='p-4'>
      <div className='flex items-center gap-3'>
        <div className='rounded-lg bg-primary/10 p-2'>
          <Cpu className='size-4 text-primary' />
        </div>
        <div>
          <p className='text-xs text-muted-foreground'>Firmware</p>
          <p className='text-sm font-medium'>
            v{device.capabilities.firmwareVersion.data.major}.{device.capabilities.firmwareVersion.data.minor}
          </p>
        </div>
      </div>
    </Card>
  )
})
