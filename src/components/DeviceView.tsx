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
import { NoDeviceDetected } from './NoDeviceDetected'
import { SkeletonDevice } from './SkeletonDevice'
import { Hash, Cpu, Battery, Zap, AlertCircle, RotateCcw } from 'lucide-react'
import { DongleLed } from './capabilities/dongleLed'

type DeviceViewProps = {
  device?: DeviceInStatusVariant
  onOpenSidebar?: () => void
}

const DeviceView = observer(({ device, onOpenSidebar }: DeviceViewProps) => {
  const {
    deviceStore: { removeDevice, retryDevice }
  } = useStore()

  const disconnect = () => {
    if (device) removeDevice(device, true)
  }

  if (!device) {
    return <NoDeviceDetected onOpenSidebar={onOpenSidebar} />
  }

  if (isStatus(device, 'Initializing')) {
    return <SkeletonDevice />
  }

  if (isStatus(device, 'Failed')) {
    return (
      <Card className='border-destructive/50 bg-destructive/5 p-6'>
        <div className='flex items-start gap-4'>
          <div className='rounded-lg bg-destructive/10 p-2.5'>
            <AlertCircle className='size-5 text-destructive' />
          </div>
          <div className='min-w-0 flex-1'>
            <h2 className='text-base font-semibold'>{device.hid.productName}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>Failed to initialize device</p>
            <code className='mt-3 block rounded-md bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive'>
              {device.failureReason.name}: {device.failureReason.message}
            </code>
            <div className='mt-4 flex gap-2'>
              <Button size='sm' variant='outline' onClick={() => retryDevice(device)}>
                <RotateCcw className='mr-2 size-3.5' />
                Retry
              </Button>
              <Button size='sm' variant='ghost' onClick={() => removeDevice(device, true)}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      </Card>
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

      <div className='animate-stagger-children mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {isCapableOf(device, ['serial']) && (
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
        )}

        {isCapableOf(device, ['firmwareVersion']) && (
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
        )}

        {isCapableOf(device, ['chargeLevel']) && (
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
        )}

        {isCapableOf(device, ['chargeStatus']) && (
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
        )}
      </div>

      <div className='animate-stagger-children mt-6 space-y-6'>
        {isCapableOf(device, ['idleTime']) && <IdleTime device={device} />}
        {isCapableOf(device, ['dpiStages']) && <DpiStages device={device} />}
        {isCapableOf(device, ['polling2']) && <Polling2 device={device} />}
        {isCapableOf(device, ['polling']) && <Polling device={device} />}
        {isCapableOf(device, ['dongleLed']) && <DongleLed device={device} />}
        {isCapableOf(device, ['dongleLedMulti']) && <DongleLedMulti device={device} />}
      </div>
    </>
  )
})

export default DeviceView
