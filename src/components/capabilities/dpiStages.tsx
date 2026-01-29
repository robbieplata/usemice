import { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash/debounce'
import { type ReadyDeviceWithCapabilities } from '@/lib/device/device'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Slider } from '../ui/slider'
import { Input } from '../ui/input'
import { observer } from 'mobx-react-lite'
import { Trash, Plus, Target } from 'lucide-react'

type DpiStagesProps = {
  device: ReadyDeviceWithCapabilities<'dpiStages'>
}

export const DpiStages = observer(({ device }: DpiStagesProps) => {
  const [localDpiLevels, setLocalDpiLevels] = useState(device.capabilities.dpiStages.data.dpiLevels)
  const [inputText, setInputText] = useState(() =>
    device.capabilities.dpiStages.data.dpiLevels.map((lvl) => String(lvl[0]))
  )

  const { minDpi, maxDpi, maxStages } = device.capabilities.dpiStages.info
  const { dpiLevels, activeStage } = device.capabilities.dpiStages.data

  useEffect(() => setLocalDpiLevels(dpiLevels), [dpiLevels])

  const debouncedSet = useMemo(() => {
    return debounce((nextLevels: typeof localDpiLevels) => {
      device.set('dpiStages', {
        ...device.capabilities.dpiStages.data,
        dpiLevels: nextLevels
      })
    }, 300)
  }, [device, device.capabilities.dpiStages.data])

  useEffect(() => () => debouncedSet.cancel(), [debouncedSet])

  const clamp = (n: number) => Math.min(maxDpi, Math.max(minDpi, n))

  useEffect(() => {
    setLocalDpiLevels(device.capabilities.dpiStages.data.dpiLevels)
    setInputText(device.capabilities.dpiStages.data.dpiLevels.map((lvl) => String(lvl[0])))
  }, [device.capabilities.dpiStages.data.dpiLevels])

  const setStageValue = (index: number, next: number) => {
    const nextLevels = [...localDpiLevels]
    nextLevels[index] = [next, next]
    setLocalDpiLevels(nextLevels)
    setInputText((t) => {
      const copy = [...t]
      copy[index] = String(next)
      return copy
    })
    debouncedSet(nextLevels)
  }

  const commitInput = (index: number) => {
    const raw = inputText[index]
    if (raw.trim() === '') {
      setInputText((t) => {
        const copy = [...t]
        copy[index] = String(localDpiLevels[index][0])
        return copy
      })
      return
    }
    const parsed = Number(raw)
    if (Number.isNaN(parsed)) return
    setStageValue(index, clamp(parsed))
  }

  const removeStage = (index: number) => {
    if (localDpiLevels.length <= 1) return

    const nextLevels = localDpiLevels.filter((_, i) => i !== index)
    const newActiveStage =
      activeStage > index + 1
        ? activeStage - 1
        : activeStage === index + 1
          ? Math.min(activeStage, nextLevels.length)
          : activeStage

    setLocalDpiLevels(nextLevels)
    setInputText((t) => t.filter((_, i) => i !== index))

    device.set('dpiStages', {
      ...device.capabilities.dpiStages.data,
      dpiLevels: nextLevels,
      activeStage: newActiveStage
    })
  }

  const addStage = () => {
    if (localDpiLevels.length >= maxStages) return

    const defaultDpi = Math.round((minDpi + maxDpi) / 2)
    const nextLevels: [number, number][] = [...localDpiLevels, [defaultDpi, defaultDpi]]

    setLocalDpiLevels(nextLevels)
    setInputText((t) => [...t, String(defaultDpi)])

    device.set('dpiStages', {
      ...device.capabilities.dpiStages.data,
      dpiLevels: nextLevels
    })
  }

  return (
    <section className='space-y-3'>
      <Card size='sm' className='space-y-4 p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-muted p-2'>
              <Target className='size-4 text-muted-foreground' />
            </div>
            <h3 className='text-sm font-medium'>DPI Stages</h3>
          </div>
          <span className='text-sm text-muted-foreground'>
            Active: <span className='font-semibold text-foreground'>{activeStage}</span>
          </span>
        </div>

        {localDpiLevels.map((level, index) => {
          const isActive = activeStage === index + 1
          const value = level[0]

          return (
            <div key={index + 1}>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-2'>
                  <Button
                    className={`min-w-20 justify-center ${isActive ? 'text-primary-foreground' : ''}`}
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() =>
                      device.set('dpiStages', {
                        ...device.capabilities.dpiStages.data,
                        activeStage: index + 1
                      })
                    }
                  >
                    Stage {index + 1}
                  </Button>

                  <div className='text-sm w-20 text-center'>
                    <span className='font-medium tabular-nums'>{value}</span> Dpi
                  </div>
                </div>

                <div className='flex w-full items-center gap-3'>
                  <div className='flex-1'>
                    <Slider
                      step={50}
                      min={minDpi}
                      max={maxDpi}
                      value={[value]}
                      onValueChange={([next]) => setStageValue(index, next)}
                    />
                    <div className='mt-2 flex justify-between text-xs text-muted-foreground'>
                      <span>{minDpi}</span>
                      <span>{maxDpi}</span>
                    </div>
                  </div>
                  <Input
                    className='w-24'
                    type='text'
                    inputMode='numeric'
                    value={inputText[index] ?? String(value)}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '' || /^\d+$/.test(v)) {
                        setInputText((t) => {
                          const copy = [...t]
                          copy[index] = v
                          return copy
                        })
                      }
                    }}
                    onBlur={() => commitInput(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur()
                      if (e.key === 'Escape') {
                        setInputText((t) => {
                          const copy = [...t]
                          copy[index] = String(localDpiLevels[index][0])
                          return copy
                        })
                        e.currentTarget.blur()
                      }
                    }}
                  />
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-8'
                  disabled={localDpiLevels.length <= 1}
                  onClick={() => removeStage(index)}
                  aria-label={`Remove stage ${index + 1}`}
                >
                  <Trash className='size-4' />
                </Button>
              </div>
            </div>
          )
        })}
        {device.capabilities.dpiStages.info.maxStages > localDpiLevels.length && (
          <div className='flex'>
            <Button
              className='min-w-20 justify-center'
              disabled={localDpiLevels.length >= maxStages}
              onClick={addStage}
            >
              <Plus className='size-4' />
            </Button>
          </div>
        )}
      </Card>
    </section>
  )
})
