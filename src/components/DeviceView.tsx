import { observer } from 'mobx-react-lite'
import { isCapableOf, isStatus, type DeviceInStatusVariant } from '../lib/device/device'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { useStore } from '@/stores'
import { IdleTime } from './capabilities/idleTime'
import { DpiStages } from './capabilities/dpiStages'
import { Polling2 } from './capabilities/polling2'
import { Polling } from './capabilities/polling'
import { DongleLedMulti } from './capabilities/dongleLedMulti'
import { SkeletonDevice } from './SkeletonDevice'
import { Hash, Cpu, Battery, Zap } from 'lucide-react'

type DeviceViewProps = {
  device?: DeviceInStatusVariant
}

const DeviceView = observer(({ device }: DeviceViewProps) => {
  const {
    deviceStore: { removeDevice }
  } = useStore()

  const disconnect = () => {
    if (device) removeDevice(device, true)
  }

  if (!device) {
    return <SkeletonDevice />
  }

  if (isStatus(device, 'Initializing')) {
    return <SkeletonDevice />
  }

  if (isStatus(device, 'Failed')) {
    return (
      <div className='rounded-xl p-4'>
        <h2 className='text-base font-semibold'>{device.hid.productName}</h2>
        <p className='mt-1 text-sm'>Device failed to initialize: {device.failureReason.message}</p>
      </div>
    )
  }

  return (
    <>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h2 className='truncate text-lg font-semibold'>{device.hid.productName}</h2>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={disconnect}>{'Disconnect'}</Button>
        </div>
      </div>

      <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {isCapableOf(device, ['serial']) && (
          <Card size='sm' className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-muted p-2'>
                <Hash className='size-4 text-muted-foreground' />
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>Serial</p>
                <p className='font-mono text-sm font-medium'>{device.capabilities.serial.data.serialNumber}</p>
              </div>
            </div>
          </Card>
        )}

        {isCapableOf(device, ['firmwareVersion']) && (
          <Card size='sm' className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-muted p-2'>
                <Cpu className='size-4 text-muted-foreground' />
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>Firmware</p>
                <p className='text-sm font-medium'>
                  v{device.capabilities.firmwareVersion.data.major}.{device.capabilities.firmwareVersion.data.minor}
                </p>
              </div>
            </div>
          </Card>
        )}

        {isCapableOf(device, ['chargeLevel']) && (
          <Card size='sm' className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-muted p-2'>
                <Battery className='size-4 text-muted-foreground' />
              </div>
              <div>
                <p className='text-xs text-muted-foreground'>Battery</p>
                <p className='text-sm font-medium'>{device.capabilities.chargeLevel.data.percentage.toFixed(0)}%</p>
              </div>
            </div>
          </Card>
        )}

        {isCapableOf(device, ['chargeStatus']) && (
          <Card size='sm' className='p-4'>
            <div className='flex items-center gap-3'>
              <div
                className={`rounded-lg p-2 ${device.capabilities.chargeStatus.data.status ? 'bg-green-500/10' : 'bg-muted'}`}
              >
                <Zap
                  className={`size-4 ${device.capabilities.chargeStatus.data.status ? 'text-green-500' : 'text-muted-foreground'}`}
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
        )}
      </div>

      <div className='mt-6 space-y-6'>
        {isCapableOf(device, ['idleTime']) && <IdleTime device={device} />}
        {isCapableOf(device, ['dpiStages']) && <DpiStages device={device} />}
        {isCapableOf(device, ['polling2']) && <Polling2 device={device} />}
        {isCapableOf(device, ['polling']) && <Polling device={device} />}
        {isCapableOf(device, ['dongleLedMulti']) && <DongleLedMulti device={device} />}
      </div>
    </>
  )
})

export default DeviceView
