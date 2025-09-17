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

export const AlertDeleteDialog = ({
  title = 'Are you absolutely sure?',
  description = 'This action will not be able to revert back',
  mutation,
  handleDelete,
  onClose,
}: {
  title?: string
  description?: string
  mutation: UseMutationResult
  handleDelete: () => void
  onClose: () => void
}) => {
  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogDescription></AlertDialogDescription>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>

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
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            className={cn('flex gap-2', buttonVariants({ variant: 'destructive' }))}
            onClick={handleDelete}>
            {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
