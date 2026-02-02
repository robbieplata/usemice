import { useEffect, useState, useRef } from 'react'
import { type ReadyDeviceWithCapabilities } from '@/lib/device/device'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Slider } from '../ui/slider'
import { Input } from '../ui/input'
import { observer } from 'mobx-react-lite'
import { Trash, Plus, Target, Link, Unlink, GripVertical } from 'lucide-react'

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

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragNodeRef = useRef<HTMLDivElement | null>(null)

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

  const computePreviewOrder = (): number[] => {
    const order = localDpiLevels.map((_, i) => i)
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      return order
    }
    const result = order.filter((i) => i !== draggedIndex)
    result.splice(dragOverIndex, 0, draggedIndex)
    return result
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)
    dragNodeRef.current = e.currentTarget
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))

    const rect = e.currentTarget.getBoundingClientRect()
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.opacity = '0.4'
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-9999px'
    dragImage.style.left = '-9999px'
    dragImage.style.width = `${rect.width}px`
    dragImage.style.background = 'transparent'
    dragImage.style.pointerEvents = 'none'
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, e.nativeEvent.offsetX, e.nativeEvent.offsetY)

    requestAnimationFrame(() => {
      setTimeout(() => {
        document.body.removeChild(dragImage)
      }, 0)
    })
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newOrder = computePreviewOrder()
      const nextLevels = newOrder.map((i) => localDpiLevels[i]) as [number, number][]
      const nextInputX = newOrder.map((i) => inputTextX[i])
      const nextInputY = newOrder.map((i) => inputTextY[i])

      let newActiveStage = activeStage
      const oldActiveIndex = activeStage - 1
      const newActiveIndex = newOrder.indexOf(oldActiveIndex)
      if (newActiveIndex !== -1) {
        newActiveStage = newActiveIndex + 1
      }

      setLocalDpiLevels(nextLevels)
      setInputTextX(nextInputX)
      setInputTextY(nextInputY)

      device.set('dpiStages', {
        ...device.capabilities.dpiStages.data,
        dpiLevels: nextLevels,
        activeStage: newActiveStage
      })
    }

    setDraggedIndex(null)
    setDragOverIndex(null)
    dragNodeRef.current = null
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const previewOrder = computePreviewOrder()

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

        {previewOrder.map((originalIndex, displayIndex) => {
          const level = localDpiLevels[originalIndex]
          const isActive = activeStage === originalIndex + 1
          const valueX = level[0]
          const valueY = level[1]
          const isDragging = draggedIndex === originalIndex
          const isBeingDraggedOver = dragOverIndex === displayIndex && draggedIndex !== null

          return (
            <div
              key={originalIndex}
              draggable
              onDragStart={(e) => handleDragStart(e, originalIndex)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, displayIndex)}
              className={`transition-all duration-200 ${
                isDragging ? 'opacity-40 bg-transparent' : ''
              } ${isBeingDraggedOver ? 'translate-y-1' : ''}`}
              style={isDragging ? { background: 'transparent' } : undefined}
            >
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-center gap-2'>
                  <div
                    className='cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground transition-colors'
                    title='Drag to reorder'
                  >
                    <GripVertical className='size-4' />
                  </div>
                  <Button
                    className={`min-w-20 justify-center ${isActive ? 'text-primary-foreground' : ''}`}
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() =>
                      device.set('dpiStages', {
                        ...device.capabilities.dpiStages.data,
                        activeStage: originalIndex + 1
                      })
                    }
                  >
                    Stage {displayIndex + 1}
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
                          setStageValueXY(originalIndex, values[0], values[1])
                        } else {
                          setStageValue(originalIndex, values[0])
                        }
                      }}
                      onValueCommit={(values) => {
                        const nextLevels = [...localDpiLevels] as [number, number][]
                        nextLevels[originalIndex] = independentXY ? [values[0], values[1]] : [values[0], values[0]]
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
                      value={inputTextX[originalIndex] ?? String(valueX)}
                      onChange={(e) => {
                        const v = e.target.value
                        if (v === '' || /^\d+$/.test(v)) {
                          setInputTextX((t) => {
                            const copy = [...t]
                            copy[originalIndex] = v
                            return copy
                          })
                        }
                      }}
                      onBlur={() => commitInputX(originalIndex)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur()
                        if (e.key === 'Escape') {
                          setInputTextX((t) => {
                            const copy = [...t]
                            copy[originalIndex] = String(localDpiLevels[originalIndex][0])
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
                          value={inputTextY[originalIndex] ?? String(valueY)}
                          onChange={(e) => {
                            const v = e.target.value
                            if (v === '' || /^\d+$/.test(v)) {
                              setInputTextY((t) => {
                                const copy = [...t]
                                copy[originalIndex] = v
                                return copy
                              })
                            }
                          }}
                          onBlur={() => commitInputY(originalIndex)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur()
                            if (e.key === 'Escape') {
                              setInputTextY((t) => {
                                const copy = [...t]
                                copy[originalIndex] = String(localDpiLevels[originalIndex][1])
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
                  onClick={() => removeStage(originalIndex)}
                  aria-label={`Remove stage ${displayIndex + 1}`}
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
