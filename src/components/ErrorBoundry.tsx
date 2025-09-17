import { Button } from '@/components/ui/button.tsx'
import { cn } from '@/utilities/cn.ts'
import { UseQueryResult, UseSuspenseQueryResult } from '@tanstack/react-query'
import { RefreshCcw } from 'lucide-react'
import { ReactNode } from 'react'
import { useRouteError } from 'react-router-dom'

export function ErrorBoundary({ query }: { query?: UseQueryResult | UseSuspenseQueryResult; children?: ReactNode }) {
  const error = useRouteError()
  console.error(error)

  return (
    <div
      className='bg-red-100 dark:bg-red-100 dark:text-red-500 border-t-4 border-red-500 rounded-b text-red-900 px-4 py-3 shadow-md rounded justify-self-center'
      role='alert'>
      <div>
        <div className='flex items-center justify-between mb-5'>
          <div className='flex items-center'>
            <svg className='fill-current h-6 w-6 mr-4' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
              <path d='M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z' />
            </svg>
            <ul>
              <li className='font-bold'>Something bad happened.</li>
              <li className=''>Please report the issue by following the steps below:</li>
            </ul>
          </div>

          {query?.isFetched && (
            <Button
              className='text-sm self-start flex gap-2'
              variant='destructive'
              size='sm'
              disabled={query.isFetching}
              onClick={() => query.refetch()}>
              <RefreshCcw
                className={cn('size-5', query.isFetching ? 'animate-spin' : '', 'rotate-180 transition-all')}
              />
              Retry
            </Button>
          )}
        </div>

        <ol className='px-5 list-decimal'>
          <li>
            <p className='mb-0 inline mr-2'>open Devtool`s Console by pressing</p>
            <kbd>CTRL/CMD</kbd> + <kbd>SHIFT</kbd> + <kbd>j</kbd>
          </li>
          <li>Take a screenshot. Url, Devtool`s Console and Current screen</li>
          <li>Shared it to person-in-charge</li>
        </ol>
      </div>
    </div>
  )
}
