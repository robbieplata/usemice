import { Skeleton } from './ui/skeleton'

export const SkeletonDevice = () => {
  return (
    <>
      <div className='space-y-2'>
        <Skeleton className='h-6 w-2/3 max-w-[360px]' />
      </div>

      <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <Skeleton className='h-[72px] w-full rounded-xl border' />
        <Skeleton className='h-[72px] w-full rounded-xl border' />
        <Skeleton className='h-[72px] w-full rounded-xl border' />
        <Skeleton className='h-[72px] w-full rounded-xl border' />
      </div>

      <div className='mt-6 space-y-6'>
        {[1, 2, 3, 4].map((section) => (
          <section key={section} className='space-y-3'>
            <div className='rounded-xl border p-3 space-y-3'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
              <Skeleton className='h-4 w-2/3' />
            </div>
          </section>
        ))}
      </div>
    </>
  )
}
