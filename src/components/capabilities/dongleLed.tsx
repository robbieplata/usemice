import { useState } from 'react'
import { type RazerDevice, type Ready } from '../../lib/device/device.ts'
import { DongleLedMode } from '../../lib/device/razer/index.ts'
import { Card } from '../ui/card.tsx'
import { Button } from '../ui/button.tsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu.tsx'
import { observer } from 'mobx-react-lite'
import { ChevronDown, Lightbulb } from 'lucide-react'

type DongleLedProps = {
  device: Ready<RazerDevice<'dongleLed'>>
}

const modeLabels: Record<number, string> = {
  [DongleLedMode.CONNECTION_STATUS]: 'Connection Status',
  [DongleLedMode.BATTERY_STATUS]: 'Battery Status',
  [DongleLedMode.BATTERY_WARNING]: 'Battery Warning',
}

const modeOptions = Object.entries(DongleLedMode).filter(([key]) => isNaN(Number(key))) as [string, number][]

export const DongleLed = observer(({ device }: DongleLedProps) => {
  const initialData = device.capabilities.dongleLed.data
  const [mode, setMode] = useState<number>(initialData.mode)

  const updateMode = (value: number) => {
    setMode(value)
    device.capabilities.dongleLed.set({ mode: value })
  }

  return (
    <section>
      <Card size='sm' className='p-4'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='rounded-lg bg-primary/10 p-2'>
            <Lightbulb className='size-4 text-primary' />
          </div>
          <h3 className='text-sm font-medium'>Dongle LED</h3>
        </div>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm'>Mode</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='w-44 justify-between'>
                  <span>{modeLabels[mode]}</span>
                  <ChevronDown className='size-4 ml-2 opacity-50' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-44'>
                {modeOptions.map(([, value]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => updateMode(value)}
                    className='flex items-center justify-between'
                  >
                    <span>{modeLabels[value]}</span>
                    {value === mode && <span className='text-xs text-muted-foreground'>Current</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </section>
  )
})
