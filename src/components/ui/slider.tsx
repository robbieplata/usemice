import * as React from 'react'
import { Slider as SliderPrimitive, Tooltip as TooltipPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const [isDragging, setIsDragging] = React.useState(false)

  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot='slider'
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'data-vertical:min-h-40 relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col',
        className
      )}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot='slider-track'
        className='bg-muted rounded-full data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5 bg-muted relative grow overflow-hidden data-horizontal:w-full data-vertical:h-full'
      >
        <SliderPrimitive.Range
          data-slot='slider-range'
          className='bg-primary absolute select-none data-horizontal:h-full data-vertical:w-full'
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <TooltipPrimitive.Provider key={index} delayDuration={0}>
          <TooltipPrimitive.Root open={isDragging}>
            <TooltipPrimitive.Trigger asChild>
              <SliderPrimitive.Thumb
                data-slot='slider-thumb'
                className='border-primary ring-ring/50 size-4 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50'
              />
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                side='top'
                sideOffset={8}
                className='rounded-md px-2 py-1 text-xs bg-foreground text-background z-50'
              >
                {_values[index]}
                <TooltipPrimitive.Arrow className='fill-foreground' />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
