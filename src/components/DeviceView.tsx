import { observer } from 'mobx-react-lite'
import { isCapableOf, isStatus, type IDevice } from '../lib/device/device'
import { Button } from './ui/button'
import { useStore } from '@/stores'
import { IdleTime } from './capabilities/idleTime'
import { DpiStages } from './capabilities/dpiStages'
import { Polling2 } from './capabilities/polling2'
import { Polling } from './capabilities/polling'
import { SkeletonDevice } from './skeletonDevice'

type DeviceViewProps = {
  device?: IDevice
}

const DeviceView = observer(({ device }: DeviceViewProps) => {
  const {
    deviceStore: { removeDevice }
  } = useStore()

  if (!device || isStatus(device, 'Initializing')) {
    return <SkeletonDevice />
  }

  if (isStatus(device, 'Failed')) {
    return (
      <div className='rounded-xl p-4'>
        <h2 className='text-base font-semibold'>{device.hid.productName}</h2>
        <p className='mt-1 text-sm'>Device failed to initialize: {device.error.message}</p>
      </div>
    )
  }

  const disconnect = () => {
    removeDevice(device, true)
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

      <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {isCapableOf(device, ['serial']) && (
          <div className='rounded-xl border p-3'>
            <p className='text-xs font-medium'>Serial</p>
            <p className='mt-1 font-mono text-sm'>{device.capabilityData.serial.serialNumber}</p>
          </div>
        )}

        {isCapableOf(device, ['firmwareVersion']) && (
          <div className='rounded-xl border p-3'>
            <p className='text-xs font-medium'>Firmware</p>
            <p className='mt-1 text-sm'>
              v{device.capabilityData.firmwareVersion.major}.{device.capabilityData.firmwareVersion.minor}
            </p>
          </div>
        )}

        {isCapableOf(device, ['chargeLevel']) && (
          <div className='rounded-xl border p-3'>
            <p className='text-xs font-medium'>Battery</p>
            <p className='mt-1 text-sm'>{device.capabilityData.chargeLevel.percentage.toFixed(0)}%</p>
          </div>
        )}

        {isCapableOf(device, ['chargeStatus']) && (
          <div className='rounded-xl border p-3'>
            <p className='text-xs font-medium'>Charge Status</p>
            <p className='mt-1 text-sm'>{device.capabilityData.chargeStatus.status ? 'Charging' : 'Not Charging'}</p>
          </div>
        )}
      </div>

      <div className='mt-6 space-y-6'>
        {isCapableOf(device, ['idleTime']) && <IdleTime device={device} />}
        {isCapableOf(device, ['dpiStages']) && <DpiStages device={device} />}
        {isCapableOf(device, ['polling2']) && <Polling2 device={device} />}
        {isCapableOf(device, ['polling']) && <Polling device={device} />}
      </div>
    </>
  )
})

export default DeviceView
