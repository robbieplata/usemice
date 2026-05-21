import { Battery } from 'lucide-react'
import { Card } from '../../ui/card.tsx'
import { type RazerDevice, type Ready } from '../../../lib/device.ts'
import { observer } from 'mobx-react-lite'

type ChargeLevelProps = {
  device: Ready<RazerDevice<'chargeLevel'>>
}

export const ChargeLevel = observer(({ device }: ChargeLevelProps) => {
  return (
    <Card size='sm' className='p-4'>
      <div className='flex items-center gap-3'>
        <div className='rounded-lg bg-primary/10 p-2'>
          <Battery className='size-4 text-primary' />
        </div>
        <div>
          <p className='text-xs text-muted-foreground'>Battery</p>
          <p className='text-sm font-medium'>{device.capabilities.chargeLevel.data.percentage.toFixed(0)}%</p>
        </div>
      </div>
    </Card>
  )
})
