import { Download } from 'lucide-react'
import { usePwaInstall } from '@/hooks/usePwaInstall.ts'
import { Button } from './ui/button.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip.tsx'

export function PwaInstallButton() {
  const { canShow, install } = usePwaInstall()

  if (!canShow) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='size-9'
          onClick={() => void install()}
          aria-label='Install app'
        >
          <Download className='size-5' />
        </Button>
      </TooltipTrigger>
      <TooltipContent side='bottom'>Install app</TooltipContent>
    </Tooltip>
  )
}
