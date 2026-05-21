import { Card } from '../../ui/card.tsx'
import { type RazerDevice, type Ready } from '../../../lib/device.ts'
import { Hash } from 'lucide-react'
import { observer } from 'mobx-react-lite'

type SerialProps = {
  device: Ready<RazerDevice<'serial'>>
}

export const Serial = observer(({ device }: SerialProps) => {
  return (
    <Card size='sm' className='p-4'>
      <div className='flex items-center gap-3'>
        <div className='rounded-lg bg-primary/10 p-2'>
          <Hash className='size-4 text-primary' />
        </div>
        <div>
          <p className='text-xs text-muted-foreground'>Serial</p>
          <p className='font-mono text-sm font-medium'>{device.capabilities.serial.data.serialNumber}</p>
        </div>
      </div>
    </Card>
  )
})
