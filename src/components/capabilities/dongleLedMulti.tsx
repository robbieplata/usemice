import { useState } from 'react'
import { type RazerDevice, type Ready } from '../../lib/device/device.ts'
import { DongleLedMultiMode } from '../../lib/device/razer/index.ts'
import { Card } from '../ui/card.tsx'
import { Button } from '../ui/button.tsx'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu.tsx'
import { observer } from 'mobx-react-lite'
import { ChevronDown, Lightbulb } from 'lucide-react'

type DongleLedMultiProps = {
  device: Ready<RazerDevice<'dongleLedMulti'>>
}

const modeLabels: Record<number, string> = {
  [DongleLedMultiMode.OFF]: 'Off',
  [DongleLedMultiMode.BATTERY_STATUS]: 'Battery Status',
  [DongleLedMultiMode.CONNECTION_STATUS]: 'Connection Status',
  [DongleLedMultiMode.POLLING_RATE_INDICATOR]: 'Polling Rate',
  [DongleLedMultiMode.DPI_INDICATOR]: 'DPI Indicator',
}

const modeOptions = Object.entries(DongleLedMultiMode).filter(([key]) => isNaN(Number(key))) as [string, number][]

export const DongleLedMulti = observer(({ device }: DongleLedMultiProps) => {
  const initialData = device.capabilities.dongleLedMulti.data
  const [modes, setModes] = useState<[number, number, number]>([
    initialData.modes[0],
    initialData.modes[1],
    initialData.modes[2],
  ])

  const updateMode = (index: 0 | 1 | 2, value: number) => {
    const newModes: [number, number, number] = [...modes] as [number, number, number]
    newModes[index] = value
    setModes(newModes)
    device.capabilities.dongleLedMulti.set({ modes: newModes })
  }

  const ledLabels = ['Left Mode', 'Middle Mode', 'Right Mode']

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
          {modes.map((mode, index) => (
            <div key={index} className='flex items-center justify-between'>
              <span className='text-sm'>{ledLabels[index]}</span>
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
                      onClick={() => updateMode(index as 0 | 1 | 2, value)}
                      className='flex items-center justify-between'
                    >
                      <span>{modeLabels[value]}</span>
                      {value === mode && <span className='text-xs text-muted-foreground'>Current</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
})
