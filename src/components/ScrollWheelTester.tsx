import { useCallback, useEffect, useRef, useState } from 'react'
import { Bar, BarChart, Cell, ReferenceLine, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import type { ChartConfig } from './ui/chart'
import { ChartContainer } from './ui/chart'
import { Button } from './ui/button'
import { ArrowDown, ArrowUp, MousePointer2, RotateCcw } from 'lucide-react'
import { Badge } from './ui/badge'

type ScrollDataPoint = {
  time: number
  delta: number
}

type ScrollEvent = {
  timestamp: number
  deltaY: number
  deltaX: number
}

const chartConfig = {
  delta: {
    label: 'Scroll Delta',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig

const MAX_DATA_POINTS = 40

export function ScrollWheelTester() {
  const [data, setData] = useState<ScrollDataPoint[]>([])
  const [lastDirection, setLastDirection] = useState<'up' | 'down' | null>(null)
  const [lastDelta, setLastDelta] = useState(0)
  const [totalScrollUp, setTotalScrollUp] = useState(0)
  const [totalScrollDown, setTotalScrollDown] = useState(0)
  const [scrollEvents, setScrollEvents] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [maxAbsDelta, setMaxAbsDelta] = useState(100)

  const timeIndexRef = useRef(0)
  const recentEventsRef = useRef<ScrollEvent[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollSpeed, setScrollSpeed] = useState(0)

  const calculateScrollSpeed = useCallback(() => {
    const now = performance.now()
    const recentEvents = recentEventsRef.current.filter((e) => now - e.timestamp < 1000)
    recentEventsRef.current = recentEvents

    if (recentEvents.length < 2) {
      return 0
    }

    return recentEvents.length
  }, [])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!isListening) return

      e.preventDefault()
      e.stopPropagation()

      const deltaY = e.deltaY
      const deltaX = e.deltaX

      recentEventsRef.current.push({
        timestamp: performance.now(),
        deltaY,
        deltaX
      })

      if (deltaY !== 0) {
        const direction = deltaY > 0 ? 'down' : 'up'
        setLastDirection(direction)
        setLastDelta(Math.abs(deltaY))

        if (direction === 'up') {
          setTotalScrollUp((prev) => prev + Math.abs(deltaY))
        } else {
          setTotalScrollDown((prev) => prev + Math.abs(deltaY))
        }
      }

      setScrollEvents((prev) => prev + 1)
      setScrollSpeed(calculateScrollSpeed())

      setData((prev) => {
        const newPoint: ScrollDataPoint = {
          time: timeIndexRef.current++,
          delta: -deltaY
        }
        const newData = [...prev, newPoint].slice(-MAX_DATA_POINTS)
        const maxAbs = Math.max(...newData.map((d) => Math.abs(d.delta)), 100)
        setMaxAbsDelta(maxAbs)
        return newData
      })
    },
    [isListening, calculateScrollSpeed]
  )

  useEffect(() => {
    if (!isListening) return

    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [isListening, handleWheel])

  useEffect(() => {
    if (!isListening) return

    const interval = setInterval(() => {
      setScrollSpeed(calculateScrollSpeed())
    }, 200)

    return () => clearInterval(interval)
  }, [isListening, calculateScrollSpeed])

  const handleReset = () => {
    setData([])
    setLastDirection(null)
    setLastDelta(0)
    setTotalScrollUp(0)
    setTotalScrollDown(0)
    setScrollEvents(0)
    setScrollSpeed(0)
    timeIndexRef.current = 0
    recentEventsRef.current = []
  }

  const toggleListening = () => {
    setIsListening((prev) => !prev)
  }

  return (
    <Card className='w-full'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-primary/10 p-2'>
            <MousePointer2 className='size-4 text-primary' />
          </div>
          <div>
            <CardTitle className='text-base'>Scroll Wheel Tester</CardTitle>
            <CardDescription>Scroll over the chart area to test</CardDescription>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={toggleListening}>
            {isListening ? 'Pause' : 'Start'}
          </Button>
          <Button variant='ghost' size='sm' onClick={handleReset}>
            <RotateCcw className='size-3' />
          </Button>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Direction:</span>
            {lastDirection ? (
              <Badge variant='secondary' className='flex items-center gap-1'>
                {lastDirection === 'up' ? <ArrowUp className='size-3' /> : <ArrowDown className='size-3' />}
                {lastDirection}
              </Badge>
            ) : (
              <Badge variant='outline'>—</Badge>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Delta:</span>
            <Badge variant='outline' className='tabular-nums font-mono'>
              {lastDelta}
            </Badge>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Speed:</span>
            <Badge variant='outline' className='tabular-nums font-mono'>
              {scrollSpeed}/s
            </Badge>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Events:</span>
            <Badge variant='outline' className='tabular-nums font-mono'>
              {scrollEvents}
            </Badge>
          </div>
          {isListening && (
            <Badge variant='default' className='ml-auto animate-pulse'>
              Listening
            </Badge>
          )}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='flex items-center gap-2'>
              <ArrowUp className='size-4 text-green-500' />
              <span className='text-sm'>Total Up</span>
            </div>
            <span className='font-mono text-sm font-medium'>{totalScrollUp.toLocaleString()}</span>
          </div>
          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='flex items-center gap-2'>
              <ArrowDown className='size-4 text-red-500' />
              <span className='text-sm'>Total Down</span>
            </div>
            <span className='font-mono text-sm font-medium'>{totalScrollDown.toLocaleString()}</span>
          </div>
        </div>

        <div
          ref={containerRef}
          className={`rounded-lg border-2 border-dashed transition-colors ${
            isListening ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/20'
          }`}
        >
          <ChartContainer config={chartConfig} className='h-[200px] w-full'>
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 10,
                left: 0,
                bottom: 0
              }}
            >
              <XAxis dataKey='time' tickLine={false} axisLine={false} tick={false} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[-maxAbsDelta, maxAbsDelta]} />
              <ReferenceLine y={0} stroke='var(--border)' />
              <Bar dataKey='delta' radius={[2, 2, 0, 0]} isAnimationActive={false}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.delta >= 0 ? 'var(--chart-2)' : 'var(--chart-1)'} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        {scrollEvents === 0 && (
          <p className='text-center text-sm text-muted-foreground'>
            Scroll your mouse wheel over the chart area to see the data
          </p>
        )}
      </CardContent>
    </Card>
  )
}
