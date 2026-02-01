import { useEffect, useState } from 'react'
import { type ReadyDeviceWithCapabilities } from '@/lib/device/device'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Slider } from '../ui/slider'
import { Input } from '../ui/input'
import { observer } from 'mobx-react-lite'
import { Trash, Plus, Target, Link, Unlink } from 'lucide-react'

type DpiStagesProps = {
  device: ReadyDeviceWithCapabilities<'dpiStages'>
}

export const DpiStages = observer(({ device }: DpiStagesProps) => {
  const [localDpiLevels, setLocalDpiLevels] = useState(device.capabilities.dpiStages.data.dpiLevels)
  const [inputTextX, setInputTextX] = useState(() =>
    device.capabilities.dpiStages.data.dpiLevels.map((lvl) => String(lvl[0]))
  )
  const [inputTextY, setInputTextY] = useState(() =>
    device.capabilities.dpiStages.data.dpiLevels.map((lvl) => String(lvl[1]))
  )
  const [independentXY, setIndependentXY] = useState(() =>
    device.capabilities.dpiStages.data.dpiLevels.some((lvl) => lvl[0] !== lvl[1])
  )

  const { minDpi, maxDpi, maxStages } = device.capabilities.dpiStages.info
  const { dpiLevels, activeStage } = device.capabilities.dpiStages.data

  useEffect(() => setLocalDpiLevels(dpiLevels), [dpiLevels])

  const commitLevels = (nextLevels: typeof localDpiLevels) => {
    device.set('dpiStages', {
      ...device.capabilities.dpiStages.data,
      dpiLevels: nextLevels
    })
  }

  const clamp = (n: number) => Math.min(maxDpi, Math.max(minDpi, n))

  useEffect(() => {
    setLocalDpiLevels(device.capabilities.dpiStages.data.dpiLevels)
    setInputTextX(device.capabilities.dpiStages.data.dpiLevels.map((lvl) => String(lvl[0])))
    setInputTextY(device.capabilities.dpiStages.data.dpiLevels.map((lvl) => String(lvl[1])))
  }, [device.capabilities.dpiStages.data.dpiLevels])

  const setStageValueXY = (index: number, nextX: number, nextY: number) => {
    const nextLevels = [...localDpiLevels] as [number, number][]
    nextLevels[index] = [nextX, nextY]
    setLocalDpiLevels(nextLevels)
    setInputTextX((t) => {
      const copy = [...t]
      copy[index] = String(nextX)
      return copy
    })
    setInputTextY((t) => {
      const copy = [...t]
      copy[index] = String(nextY)
      return copy
    })
  }

  const setStageValue = (index: number, next: number) => {
    setStageValueXY(index, next, next)
  }

  const setStageValueX = (index: number, nextX: number) => {
    const nextLevels = [...localDpiLevels] as [number, number][]
    nextLevels[index] = [nextX, nextLevels[index][1]]
    setLocalDpiLevels(nextLevels)
    setInputTextX((t) => {
      const copy = [...t]
      copy[index] = String(nextX)
      return copy
    })
  }

  const setStageValueY = (index: number, nextY: number) => {
    const nextLevels = [...localDpiLevels] as [number, number][]
    nextLevels[index] = [nextLevels[index][0], nextY]
    setLocalDpiLevels(nextLevels)
    setInputTextY((t) => {
      const copy = [...t]
      copy[index] = String(nextY)
      return copy
    })
  }

  const commitInputX = (index: number) => {
    const raw = inputTextX[index]
    if (raw.trim() === '') {
      setInputTextX((t) => {
        const copy = [...t]
        copy[index] = String(localDpiLevels[index][0])
        return copy
      })
      return
    }
    const parsed = Number(raw)
    if (Number.isNaN(parsed)) return
    if (independentXY) {
      setStageValueX(index, clamp(parsed))
    } else {
      setStageValue(index, clamp(parsed))
    }
    commitLevels(
      localDpiLevels.map((lvl, i) =>
        i === index ? (independentXY ? [clamp(parsed), lvl[1]] : [clamp(parsed), clamp(parsed)]) : lvl
      ) as [number, number][]
    )
  }

  const commitInputY = (index: number) => {
    const raw = inputTextY[index]
    if (raw.trim() === '') {
      setInputTextY((t) => {
        const copy = [...t]
        copy[index] = String(localDpiLevels[index][1])
        return copy
      })
      return
    }
    const parsed = Number(raw)
    if (Number.isNaN(parsed)) return
    setStageValueY(index, clamp(parsed))
    commitLevels(localDpiLevels.map((lvl, i) => (i === index ? [lvl[0], clamp(parsed)] : lvl)) as [number, number][])
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
    setInputTextX((t) => t.filter((_, i) => i !== index))
    setInputTextY((t) => t.filter((_, i) => i !== index))

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
    setInputTextX((t) => [...t, String(defaultDpi)])
    setInputTextY((t) => [...t, String(defaultDpi)])

    device.set('dpiStages', {
      ...device.capabilities.dpiStages.data,
      dpiLevels: nextLevels
    })
  }

  const toggleIndependentXY = () => {
    if (independentXY) {
      // Y and X were independent, they're going to be linked now
      const nextLevels = localDpiLevels.map(([x]) => [x, x] as [number, number])
      setLocalDpiLevels(nextLevels)
      setInputTextY(nextLevels.map((lvl) => String(lvl[1])))
      device.set('dpiStages', {
        ...device.capabilities.dpiStages.data,
        dpiLevels: nextLevels
      })
    }
    setIndependentXY(!independentXY)
  }

  return (
    <section className='space-y-3'>
      <Card size='sm' className='space-y-4 p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-primary/10 p-2'>
              <Target className='size-4 text-primary' />
            </div>
            <h3 className='text-sm font-medium'>DPI Stages</h3>
          </div>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='sm'
              onClick={toggleIndependentXY}
              className='gap-2 text-xs'
              title={independentXY ? 'Link X and Y DPI' : 'Separate X and Y DPI'}
            >
              {independentXY ? <Unlink className='size-3' /> : <Link className='size-3' />}
              X/Y
            </Button>
            <span className='text-sm text-muted-foreground'>
              Active: <span className='font-semibold text-foreground'>{activeStage}</span>
            </span>
          </div>
        </div>

        {localDpiLevels.map((level, index) => {
          const isActive = activeStage === index + 1
          const valueX = level[0]
          const valueY = level[1]

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
                    <span className='font-medium tabular-nums'>{valueX}</span> DPI
                  </div>
                </div>

                <div className='flex w-full items-center gap-3'>
                  <div className='flex-1'>
                    <Slider
                      step={50}
                      min={minDpi}
                      max={maxDpi}
                      value={independentXY ? [valueX, valueY] : [valueX]}
                      onValueChange={(values) => {
                        if (independentXY) {
                          setStageValueXY(index, values[0], values[1])
                        } else {
                          setStageValue(index, values[0])
                        }
                      }}
                      onValueCommit={(values) => {
                        const nextLevels = [...localDpiLevels] as [number, number][]
                        nextLevels[index] = independentXY ? [values[0], values[1]] : [values[0], values[0]]
                        commitLevels(nextLevels)
                      }}
                    />
                    <div className='mt-2 flex justify-between text-xs text-muted-foreground'>
                      <span>{minDpi}</span>
                      <span>{maxDpi}</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Input
                      className='w-16'
                      type='text'
                      inputMode='numeric'
                      value={inputTextX[index] ?? String(valueX)}
                      onChange={(e) => {
                        const v = e.target.value
                        if (v === '' || /^\d+$/.test(v)) {
                          setInputTextX((t) => {
                            const copy = [...t]
                            copy[index] = v
                            return copy
                          })
                        }
                      }}
                      onBlur={() => commitInputX(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur()
                        if (e.key === 'Escape') {
                          setInputTextX((t) => {
                            const copy = [...t]
                            copy[index] = String(localDpiLevels[index][0])
                            return copy
                          })
                          e.currentTarget.blur()
                        }
                      }}
                    />
                    {independentXY && (
                      <>
                        <span className='text-muted-foreground text-xs'>/</span>
                        <Input
                          className='w-16'
                          type='text'
                          inputMode='numeric'
                          value={inputTextY[index] ?? String(valueY)}
                          onChange={(e) => {
                            const v = e.target.value
                            if (v === '' || /^\d+$/.test(v)) {
                              setInputTextY((t) => {
                                const copy = [...t]
                                copy[index] = v
                                return copy
                              })
                            }
                          }}
                          onBlur={() => commitInputY(index)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur()
                            if (e.key === 'Escape') {
                              setInputTextY((t) => {
                                const copy = [...t]
                                copy[index] = String(localDpiLevels[index][1])
                                return copy
                              })
                              e.currentTarget.blur()
                            }
                          }}
                        />
                      </>
                    )}
                  </div>
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
