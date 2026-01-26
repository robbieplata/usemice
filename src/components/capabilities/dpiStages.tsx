import { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash/debounce'
import { type ReadyDeviceWithCapabilities } from '@/lib/device/device'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
import { Input } from '../ui/input'
import { observer } from 'mobx-react-lite'

type DpiStagesProps = {
  device: ReadyDeviceWithCapabilities<'dpiStages'>
}

export const DpiStages = observer(({ device }: DpiStagesProps) => {
  const [localDpiLevels, setLocalDpiLevels] = useState(device.capabilities.dpiStages.data.dpiLevels)
  const [inputText, setInputText] = useState(() =>
    device.capabilities.dpiStages.data.dpiLevels.map((lvl) => String(lvl[0]))
  )

  const { minDpi, maxDpi } = device.capabilities.dpiStages.info
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

  return (
    <section className='space-y-3'>
      <div className='space-y-3 border rounded-xl p-3'>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-semibold'>DPI stages</h3>
          <span className='text-sm'>
            Active: <span className='font-medium'>{activeStage}</span>
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
                    disabled={isActive}
                    onClick={() =>
                      device.set('dpiStages', {
                        ...device.capabilities.dpiStages.data,
                        activeStage: index + 1
                      })
                    }
                  >
                    Stage {index + 1}
                  </Button>

                  <div className='text-sm'>
                    <span className='font-medium tabular-nums '>{value}</span> Dpi
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
                    <div className='mt-2 flex justify-between text-xs'>
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
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
})
