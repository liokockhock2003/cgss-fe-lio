import { Loading2 } from '@/components/Loading.tsx'
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
import { Button, buttonVariants } from '@/components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { toast } from '@/components/ui/use-toast.ts'
import { useGlobalDateFormat } from '@/hooks/use-global-date-formatter.tsx'
import { q$ } from '@/store'
import { axios } from '@/utilities/axios-instance.ts'
import { cn } from '@/utilities/cn.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { useMutation } from '@tanstack/react-query'
import { format, isAfter } from 'date-fns'
import { LoaderPinwheel } from 'lucide-react'
import { EmployeeCommutingApi } from './api.ts'
import { useEmployeeCommuting } from './context.tsx'

export const CellActivityHeader = ({ month, year }: { month: number; year: number }) => {
  const dateFormatter = useGlobalDateFormat()
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ open: boolean }>({ open: false })
  const date = new Date(year, month, 2) // need to set this to 2nd, not if set to 1st, then sending payload seems like using last month end date
  const dontDisplay = isAfter(date, new Date())

  return (
    <div className='flex capitalize gap-2 px-4 text-center items-center whitespace-nowrap'>
      {format(date, dateFormatter.short)}

      {dontDisplay ? null : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='link' className='group p-0!' onClick={() => handleOpenChangeWith('open', true)}>
              <LoaderPinwheel className='size-4 group-hover:animate-spin duration-700 p-0 text-muted group-hover:text-foreground' />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Push {format(date, 'MMMM yyyy')} activities?</TooltipContent>
        </Tooltip>
      )}

      {popoverStates.open ?
        <AlertAutoPushActivities date={date} onClose={() => handleOpenChangeWith('open', false)} />
      : null}
    </div>
  )
}

export const AlertAutoPushActivities = ({ onClose, date }: { date: Date; onClose: () => void }) => {
  const { queryKey } = useEmployeeCommuting()

  const mutation = useMutation({
    mutationFn: async () => {
      return await axios
        .post(`/${EmployeeCommutingApi.main.uniqueKey}/push-activities`, {
          date,
          // @ts-ignore
          groupByIds: queryKey.at(-1).groupByIds,
        })
        .then((i) => i.data)
    },
    onSuccess: (e: number) => {
      toast({ description: `Pushed ${e} commuting activit${e > 1 ? 'ies' : 'y'}` })
      onClose()
      q$.invalidateQuery([...queryKey])
    },
  })

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Push {format(date, 'MMMM yyyy')} activities?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p>This action:</p>

              <ul className='list-disc ml-5 mt-2'>
                <li>Is very useful to auto add previous month/year</li>
                <li>Will push an activity to all active employees only.</li>
                <li>If employee already have existing activity data, then it will skip pushing.</li>
                <li>Feel free to edit/delete any activity data afterwards</li>
              </ul>
            </div>
          </AlertDialogDescription>

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
          <AlertDialogAction
            disabled={mutation.isPending}
            className={cn('flex gap-2', buttonVariants({ variant: 'secondary' }))}
            onClick={() => mutation.mutate()}>
            {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
            Push
          </AlertDialogAction>
          <AlertDialogCancel className={buttonVariants({ variant: 'destructive' })} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
