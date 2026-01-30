import { observer } from 'mobx-react-lite'
import { useStore } from '../stores'
import { ScrollArea } from './ui/scroll-area'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { AlertCircle, Trash2 } from 'lucide-react'

interface ErrorsSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ErrorsSidebar = observer(({ open, onOpenChange }: ErrorsSidebarProps) => {
  const {
    deviceStore: { selectedDevice }
  } = useStore()

  const commandErrors = selectedDevice?.commandErrors || []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className={`size-9 relative ${commandErrors.length > 0 ? 'text-destructive' : ''}`}
        >
          <AlertCircle className='size-5' />
          {commandErrors.length > 0 && (
            <span className='absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white'>
              {commandErrors.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side='right' className='w-96 p-0 flex flex-col' aria-describedby={undefined}>
        <SheetHeader className='px-4'>
          <SheetTitle className='text-base'>Errors</SheetTitle>
        </SheetHeader>
        <ScrollArea className='flex-1'>
          <div className='space-y-3 p-4 pr-6'>
            {commandErrors.length > 0 ? (
              commandErrors.map((error, index) => (
                <div key={index} className='rounded-xl border border-destructive/30 bg-destructive/5 p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='text-xs font-medium text-destructive'>{error.name}</div>
                    <div className='text-xs text-muted-foreground'>
                      {new Date(error._timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className='text-sm mt-2'>{error.message}</div>
                </div>
              ))
            ) : (
              <div className='flex flex-col items-center justify-center py-16 text-center'>
                <p className='mt-3 text-sm font-medium'>No Command Errors</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Errors resulting from malformed data or device communication will appear here.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        {commandErrors.length > 0 && (
          <div className='shrink-0 border-t p-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => selectedDevice?.clearCommandErrors()}
              className='w-full text-destructive hover:text-destructive hover:bg-destructive/10'
            >
              <Trash2 className='mr-2 size-4' />
              Clear Errors
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
})
