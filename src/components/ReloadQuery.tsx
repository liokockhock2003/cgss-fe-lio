import { Button } from '@/components/ui/button.tsx'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { cn } from '@/utilities/cn.ts'
import { UseQueryResult, UseSuspenseQueryResult } from '@tanstack/react-query'
import { RefreshCcw } from 'lucide-react'

export function ReloadQuery<T>({
  query,
  view = 'normal',
}: {
  view?: 'normal' | 'dropdown-item'
  query: UseQueryResult<T> | UseSuspenseQueryResult<T>
}) {
  const inValidateQuery = useCallback(() => query.refetch(), [])

  return view === 'normal' ?
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline' disabled={!!query.isFetching} onClick={inValidateQuery}>
            <RefreshCcw className={cn(query.isFetching ? 'animate-spin' : '', 'rotate-180 transition-all')} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Reload</TooltipContent>
      </Tooltip>
    : <DropdownMenuItem className='flex gap-4' onClick={inValidateQuery}>
        <RefreshCcw className={cn(query.isFetching ? 'animate-spin' : '', 'size-4 rotate-180 transition-all')} />
        Reload
      </DropdownMenuItem>
}
