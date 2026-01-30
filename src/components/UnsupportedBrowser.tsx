import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from './ui/card'

const UnsupportedBrowser: React.FC = () => {
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Card className='max-w-md'>
        <CardContent className='flex flex-col items-center gap-4 pt-6 text-center'>
          <div className='flex size-16 items-center justify-center rounded-full bg-destructive/10'>
            <AlertCircle className='size-8 text-destructive' />
          </div>
          <div className='space-y-2'>
            <h1 className='text-xl font-semibold'>WebHID Not Supported</h1>
            <p className='text-sm text-muted-foreground'>
              Your browser does not support the WebHID API, which is required to communicate with USB devices.
            </p>
            <p className='text-sm text-muted-foreground'>
              Please use a Chromium-based browser such as Chrome, Edge, or Brave.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UnsupportedBrowser
