import { observer } from 'mobx-react-lite'
import {
  type DeviceInStatusVariant,
  type HidppDevice,
  isCapableOf,
  isDeviceType,
  type RazerDevice,
  type Ready,
} from '../lib/device.ts'
import { Button } from './ui/button.tsx'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from './ui/card.tsx'
import { ScrollArea } from './ui/scroll-area.tsx'
import { useStore } from '../stores/index.tsx'
import { IdleTime } from './capabilities/idleTime.tsx'
import { DpiStages } from './capabilities/dpiStages.tsx'
import { Polling } from './capabilities/polling.tsx'
import { DongleLedMulti } from './capabilities/dongleLedMulti.tsx'
import { NoDeviceDetected } from './NoDeviceDetected.tsx'
import { SkeletonDevice } from './SkeletonDevice.tsx'
import { AlertCircle, Mouse, Power, RotateCcw } from 'lucide-react'
import { DongleLed } from './capabilities/dongleLed.tsx'
import { ChargeStatus } from './capabilities/chargeStatus.tsx'
import { ChargeLevel } from './capabilities/chargeLevel.tsx'
import { FirmwareVersion } from './capabilities/firmwareVersion.tsx'
import { Serial } from './capabilities/serial.tsx'
import { HidppProfile } from './capabilities/hidppProfile.tsx'

type DeviceProps = {
  device?: DeviceInStatusVariant
  onOpenSidebar?: () => void
}

const Razer = observer(({ device }: { device: Ready<RazerDevice> }) => {
  return (
    <>
      <div className='animate-stagger-children grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {isCapableOf(device, ['serial']) && <Serial device={device} />}
        {isCapableOf(device, ['firmwareVersion']) && <FirmwareVersion device={device} />}
        {isCapableOf(device, ['chargeLevel']) && <ChargeLevel device={device} />}
        {isCapableOf(device, ['chargeStatus']) && <ChargeStatus device={device} />}
      </div>
      <div className='animate-stagger-children mt-6 space-y-6'>
        {isCapableOf(device, ['idleTime']) && <IdleTime device={device} />}
        {isCapableOf(device, ['dpiStages']) && <DpiStages device={device} />}
        {isCapableOf(device, ['polling']) && <Polling device={device} />}
        {isCapableOf(device, ['dongleLed']) && <DongleLed device={device} />}
        {isCapableOf(device, ['dongleLedMulti']) && <DongleLedMulti device={device} />}
      </div>
    </>
  )
})

const Hidpp = observer(({ device }: { device: Ready<HidppDevice> }) => {
  return (
    <>
      <div className='animate-stagger-children grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {isCapableOf(device, ['chargeLevel']) && <ChargeLevel device={device} />}
      </div>
      <div className='animate-stagger-children mt-6 space-y-6'>
        {isCapableOf(device, ['profile', 'dpi']) && <HidppProfile device={device} />}
        {isCapableOf(device, ['polling']) && <Polling device={device} />}
      </div>
    </>
  )
})

const Device = observer(({ device, onOpenSidebar }: DeviceProps) => {
  const {
    deviceStore: { removeDevice, retryDevice },
  } = useStore()

  const disconnect = () => {
    if (device) removeDevice(device, true)
  }

  const DeviceContent = () => {
    if (!device) {
      return <NoDeviceDetected onOpenSidebar={onOpenSidebar} />
    }

    switch (device.status) {
      case 'Initializing':
        return <SkeletonDevice />

      case 'Ready':
        if (isDeviceType(device, 'razer')) {
          return <Razer device={device} />
        }
        if (isDeviceType(device, 'hidpp')) {
          return <Hidpp device={device} />
        }
        return <div>Unsupported device</div>
      case 'Failed':
        return (
          <div className='border-destructive/50 bg-destructive/5 p-6 rounded-lg'>
            <div className='flex items-start gap-4'>
              <div className='rounded-lg bg-destructive/10 p-2.5'>
                <AlertCircle className='size-5 text-destructive' />
              </div>
              <div className='min-w-0 flex-1'>
                <h2 className='text-base font-semibold'>{device.hid.productName}</h2>
                <p className='mt-1 text-sm text-muted-foreground'>Failed to initialize device</p>
                <code className='mt-3 block rounded-md bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive'>
                  {device.failureReason!.name}: {device.failureReason!.message}
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
          </div>
        )
    }
  }

  return (
    <Card className='xl:col-span-7 h-[90vh] overflow-hidden flex flex-col'>
      {device && device.status === 'Ready' && (
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-primary/10 p-2'>
              <Mouse className='size-5 text-primary' />
            </div>
            <div>
              <CardTitle>{device.hid.productName}</CardTitle>
            </div>
          </div>
          <CardAction>
            <Button
              variant='ghost'
              size='icon'
              onClick={disconnect}
              className='size-8 hover:text-destructive hover:bg-destructive/10'
              title='Disconnect device'
            >
              <Power className='size-4' />
            </Button>
          </CardAction>
        </CardHeader>
      )}
      <CardContent className='flex-1 min-h-0 pr-0'>
        <ScrollArea className='h-full'>
          <div className='pr-3 min-h-full'>{DeviceContent()}</div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
})

export default Device
