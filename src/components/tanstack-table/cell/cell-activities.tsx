import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { useGlobalDateFormat } from '@/hooks/use-global-date-formatter.tsx'
import { CompanyConfigurationQuery } from '@/store/query/company-configuration.ts'
import { pickValueFormatter } from '@/utilities/formatter.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import type { CellContext, Column, RowData } from '@tanstack/react-table'
import { format, lastDayOfMonth } from 'date-fns'
import type { ReactNode } from 'react'

export function CellActivities<
  TData extends RowData,
  TValue,
  TPayload extends { row: TData; columnDef: Column<TData, TValue>['columnDef'] },
>({
  info,
  accessorKey,
  children,
}: {
  info: CellContext<TData, TValue>
  accessorKey: string
  children?: (item: { rowColumnInfo: TPayload; onClose: () => void }) => ReactNode
}) {
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ edit: TPayload }>({ edit: undefined }) // prettier-ignore
  const activitiesStartFrom = new Date(CompanyConfigurationQuery.getData()?.activitiesStartFrom)

  const props = { row: info.row.original, columnDef: info.column.columnDef }
  const { year, month } = props.columnDef.meta?.columnInfo ?? { year: 0, month: 0 }

  const shouldDisabled = lastDayOfMonth(new Date(year, month - 1, 1)) <= activitiesStartFrom

  return (
    <>
      <div className='p-2 flex items-center justify-center h-full w-full text-right whitespace-nowrap tabular-nums'>
        {shouldDisabled ?
          <Tooltip delayDuration={2000}>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                className='w-full flex items-center justify-end pr-2 py-0 pl-0  dark:text-gray-700 text-gray-300 cursor-not-allowed '>
                --
              </Button>
            </TooltipTrigger>
            <TooltipContent>Activities only start at {format(activitiesStartFrom, 'dd/MM/yyyy')}</TooltipContent>
          </Tooltip>
        : <Tooltip delayDuration={2000}>
            <TooltipTrigger asChild>
              <Button
                variant='ghost'
                className='w-full flex items-center justify-end pr-2 py-0 pl-0'
                onClick={() => handleOpenChangeWith('edit', props)}>
                {pickValueFormatter(`row.original.${accessorKey}`)(info)}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Click here to see activities</TooltipContent>
          </Tooltip>
        }
      </div>

      {popoverStates.edit ?
        children?.({ rowColumnInfo: popoverStates.edit, onClose: () => handleOpenChangeWith('edit', undefined) })
      : null}
    </>
  )
}

export const CellActivityHeader = ({ month, year }: { month: number; year: number }) => {
  const dateFormatter = useGlobalDateFormat()
  return (
    <div className='capitalize px-4 text-center whitespace-nowrap'>
      {format(new Date(year, month), dateFormatter.short)}
    </div>
  )
}
