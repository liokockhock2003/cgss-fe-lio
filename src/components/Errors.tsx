import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { cn } from '@/utilities/cn.ts'
import { type UseMutationResult } from '@tanstack/react-query'

export const ErrorMutation = ({ mutation, className }: { className?: string; mutation: UseMutationResult }) => {
  return mutation.isError ?
      <div className={cn('px-6 py-2', className)}>
        <Alert variant='destructive' className='bg-red-200 dark:bg-red-300'>
          <AlertTitle>Error</AlertTitle>
          {mutation.isError && mutation.error?.message
            ? <AlertDescription>{mutation.error.message}</AlertDescription>
            : <AlertDescription>Sorry this action may not work now</AlertDescription>
          }
        </Alert>
      </div>
    : null
}
