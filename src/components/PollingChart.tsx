import { useCallback, useEffect, useRef, useState } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import type { ChartConfig } from './ui/chart'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart'
import { Button } from './ui/button'
import { Activity, Pause, Play, RotateCcw } from 'lucide-react'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'

type PollingDataPoint = {
  time: number
  rate: number
}

const chartConfig = {
  rate: {
    label: 'Polling Rate',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig

const MAX_DATA_POINTS = 60
const SAMPLE_WINDOW_MS = 1000

export function PollingChart({ className }: { className?: string }) {
  const [data, setData] = useState<PollingDataPoint[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentRate, setCurrentRate] = useState(0)
  const [avgRate, setAvgRate] = useState(0)
  const [maxRate, setMaxRate] = useState(0)

  const timestampsRef = useRef<number[]>([])
  const lastUpdateRef = useRef<number>(0)
  const timeIndexRef = useRef<number>(0)

  const calculatePollingRate = useCallback(() => {
    const now = performance.now()
    const timestamps = timestampsRef.current

    const recentTimestamps = timestamps.filter((t) => now - t < SAMPLE_WINDOW_MS)
    timestampsRef.current = recentTimestamps

    if (recentTimestamps.length < 2) {
      return 0
    }

    const rate = Math.round((recentTimestamps.length / SAMPLE_WINDOW_MS) * 1000)
    return rate
  }, [])

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isRunning) return

      const coalescedEvents = e.getCoalescedEvents?.() ?? [e]

      for (const event of coalescedEvents) {
        const timestamp = event.timeStamp || performance.now()
        timestampsRef.current.push(timestamp)
      }

      const now = performance.now()
      if (now - lastUpdateRef.current >= 100) {
        lastUpdateRef.current = now
        const rate = calculatePollingRate()

        if (rate > 0) {
          setCurrentRate(rate)
          setMaxRate((prev) => Math.max(prev, rate))

          setData((prev) => {
            const newPoint: PollingDataPoint = {
              time: timeIndexRef.current++,
              rate
            }

            const newData = [...prev, newPoint].slice(-MAX_DATA_POINTS)
            const sum = newData.reduce((acc, p) => acc + p.rate, 0)
            setAvgRate(Math.round(sum / newData.length))

            return newData
          })
        }
      }
    },
    [isRunning, calculatePollingRate]
  )

  useEffect(() => {
    if (!isRunning) return

    window.addEventListener('pointermove', handlePointerMove)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [isRunning, handlePointerMove])

  const handleStart = () => {
    setIsRunning(true)
    timestampsRef.current = []
    lastUpdateRef.current = 0
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setData([])
    setCurrentRate(0)
    setAvgRate(0)
    setMaxRate(0)
    timestampsRef.current = []
    timeIndexRef.current = 0
    lastUpdateRef.current = 0
  }

  return (
    <Card className={cn('overflow-hidden flex flex-col', className)}>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-primary/10 p-2'>
            <Activity className='size-4 text-primary' />
          </div>
          <div>
            <CardTitle className='text-base'>Polling Rate Monitor</CardTitle>
            <CardDescription>Move your mouse anywhere to measure</CardDescription>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {isRunning ? (
            <Button variant='outline' size='sm' onClick={handlePause}>
              <Pause className='mr-1 size-3' />
              Pause
            </Button>
          ) : (
            <Button variant='outline' size='sm' onClick={handleStart}>
              <Play className='mr-1 size-3' />
              Start
            </Button>
          )}
          <Button variant='ghost' size='sm' onClick={handleReset}>
            <RotateCcw className='size-3' />
          </Button>
        </div>
      </CardHeader>

      <CardContent className='flex-1 flex flex-col min-h-0 space-y-4'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Current:</span>
            <Badge variant='secondary' className='tabular-nums font-mono'>
              {currentRate} Hz
            </Badge>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Average:</span>
            <Badge variant='outline' className='tabular-nums font-mono'>
              {avgRate} Hz
            </Badge>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Max:</span>
            <Badge variant='outline' className='tabular-nums font-mono'>
              {maxRate} Hz
            </Badge>
          </div>
          {isRunning && (
            <Badge variant='default' className='ml-auto animate-pulse text-primary-foreground'>
              Recording
            </Badge>
          )}
        </div>

        <div
          className={`flex-1 min-h-0 rounded-lg border-2 border-dashed transition-colors ${
            isRunning ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/20'
          }`}
        >
          <ChartContainer config={chartConfig} className='h-full w-full'>
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0
              }}
            >
              <defs>
                <linearGradient id='fillRate' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='var(--color-rate)' stopOpacity={0.8} />
                  <stop offset='95%' stopColor='var(--color-rate)' stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis dataKey='time' tickLine={false} axisLine={false} tickMargin={8} tickFormatter={() => ''} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}`}
                domain={[0, 'auto']}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value) => (
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>{value}</span>
                        <span className='text-muted-foreground'>Hz</span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                dataKey='rate'
                type='monotone'
                fill='url(#fillRate)'
                stroke='var(--color-rate)'
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {!isRunning && data.length === 0 && (
          <p className='text-center text-sm text-muted-foreground'>
            Click "Start" and move your mouse anywhere to begin measuring polling rate
          </p>
        )}
      </CardContent>
    </Card>
  )
}
