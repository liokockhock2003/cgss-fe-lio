import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { buttonVariants } from '@/components/ui/button.tsx'
import { cn } from '@/utilities/cn.ts'
import { UseMutationResult } from '@tanstack/react-query'
import { Loading2 } from './Loading'

export const AlertStatusDialog = ({
  statusAction,
  title = 'Are you absolutely sure?',
  mutation,
  handleStatus,
  onClose,
}: {
  title?: string
  description?: string
  statusAction: 'active' | 'inactive'
  mutation: UseMutationResult
  handleStatus: () => void
  onClose: () => void
}) => {
  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>set type to either active or inactive</AlertDialogDescription>

          {mutation.isError && (
            <Alert variant='destructive' className={cn('bg-red-200 dark:bg-red-300')}>
              <AlertTitle>Error</AlertTitle>
              {mutation.isError && mutation.error?.message
                ? <AlertDescription>{mutation.error.message}</AlertDescription>
                : <AlertDescription>Sorry this action may not work now</AlertDescription>
              }
            </Alert>
          )}
        </AlertDialogHeader>

        <div className='text-sm'>
          <p>
            This action will set the type to <b>{statusAction}</b>. <br />
          </p>
          <p>You will be able to revert this action back</p>
          {statusAction === 'inactive' && (
            <ul className='list-disc ml-5 mt-2'>
              <li>You wont be able to add new data</li>
              <li>Past values will still be counted in graphs and reports</li>
            </ul>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            className={cn('flex gap-2', buttonVariants())}
            onClick={handleStatus}>
            {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
            Set to {statusAction}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
