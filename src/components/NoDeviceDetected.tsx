import { MouseImage } from './MouseImage'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'

type NoDeviceDetectedProps = {
  onOpenSidebar?: () => void
}

export const NoDeviceDetected = ({ onOpenSidebar }: NoDeviceDetectedProps) => {
  return (
    <div className='flex min-h-[80vh] flex-col items-center justify-center text-center'>
      <MouseImage className='h-75 w-auto opacity-75' />
      <p className='text-base font-medium'>No device connected</p>
      <p className='mt-1 text-sm text-muted-foreground'>Connect a supported mouse to get started</p>
      <Button className='mt-4' onClick={onOpenSidebar}>
        <Plus className='mr-2 size-4' />
        Add Device
      </Button>
    </div>
  )
}
