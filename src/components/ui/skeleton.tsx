import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      className={cn('bg-primary/10 dark:bg-muted rounded-md animate-pulse', className)}
      {...props}
    />
  )
}

export { Skeleton }
