import { Zap } from 'lucide-react'
import { Card } from '../ui/card'
import type { ReadyDeviceWithCapabilities } from '@/lib/device/device'
import { observer } from 'mobx-react-lite'

type ChargeStatusProps = {
  device: ReadyDeviceWithCapabilities<'chargeStatus'>
}

export const ChargeStatus = observer(({ device }: ChargeStatusProps) => {
  return (
    <Card size='sm' className='p-4'>
      <div className='flex items-center gap-3'>
        <div
          className={`rounded-lg p-2 ${device.capabilities.chargeStatus.data.status ? 'bg-green-500/10' : 'bg-primary/10'}`}
        >
          <Zap
            className={`size-4 ${device.capabilities.chargeStatus.data.status ? 'text-green-500' : 'text-primary'}`}
          />
        </div>
        <div>
          <p className='text-xs text-muted-foreground'>Charge Status</p>
          <p className='text-sm font-medium'>
            {device.capabilities.chargeStatus.data.status ? 'Charging' : 'Not Charging'}
          </p>
        </div>
      </div>
    </Card>
  )
})
