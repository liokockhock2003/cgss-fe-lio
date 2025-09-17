import { CommonIcon } from '@/components/common-icon.tsx'
import { CellActivities, CellActivityHeader } from '@/components/tanstack-table/cell/cell-activities.tsx'
import { FooterTotalActivities, FooterTotalHeader } from '@/components/tanstack-table/cell/cell-footer.tsx'
import { CellTotal, CellTotalHeader } from '@/components/tanstack-table/cell/cell-total.tsx'
import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { cellClassActiveInActive } from '@/components/tanstack-table/utils.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { cn } from '@/utilities/cn.ts'
import type { GenerateListOfYearsAndMonths } from '@/utilities/table-activity-transformer.ts'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { flow } from 'lodash-es'
import { DialogActivity } from './Activities/Dialog.tsx'
import { RowActions } from './TableRowActions.tsx'
import type { TStationaryCombustion } from './api.ts'

const columnHelper = createColumnHelper<TStationaryCombustion['main']['base']>()

const generateActivityColDef = (listOfYearsAndMonths: GenerateListOfYearsAndMonths) => {
  const currentYearMonth = `${new Date().getFullYear()}.${new Date().getMonth() + 1}`

  return listOfYearsAndMonths.map(([yearStr, path]) => {
    return columnHelper.group({
      id: yearStr,
      header: CellTotalHeader,
      columns: [
        // total view
        columnHelper.display({
          id: `${yearStr}.total`,
          header: () => <div className='px-4'>Total</div>,
          cell: CellTotal,
          meta: { cellClass: cellClassActiveInActive },
          footer: ({ table }) => <FooterTotalHeader table={table as never} />,
        }),

        // monthly views
        ...path.map(({ year, month }) => {
          const accessorKey = `activities.${year}.${month}` as const
          const currentYearMonthClass = currentYearMonth === `${year}.${month}` ? 'bg-muted/50' : ''

          return columnHelper.accessor(accessorKey, {
            id: `${year}-${month}`,
            header: () => <CellActivityHeader month={month - 1} year={year} />,
            cell: (info) => (
              <CellActivities info={info} accessorKey={accessorKey}>
                {(props) => <DialogActivity {...props} />}
              </CellActivities>
            ),
            footer: ({ table }) => (
              <FooterTotalActivities
                className={currentYearMonthClass}
                table={table as never}
                year={year}
                month={month}
              />
            ),
            meta: {
              columnInfo: { year, month },
              cellClass: (params) => cn(cellClassActiveInActive(params), currentYearMonthClass),
              headerClass: currentYearMonthClass,
            },
          })
        }),
      ],
    })
  })
}

export const tableColumnDef = (
  listOfYearsAndMonths: GenerateListOfYearsAndMonths,
): ColumnDef<TStationaryCombustion['main']['base']>[] => {
  return [
    columnHelper.accessor('type.name', {
      id: 'ef.name',
      enableSorting: true,
      enablePinning: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ getValue, row }) => {
        const isActive = row.original.status === 'active'

        // TEMP FIX
        // const { state, unit } = row.original.type
        // const displayUnit = state === 'gas' ? 'gj' : unit

        return (
          <div className='whitespace-nowrap p-4 flex justify-between items-center'>
            <span>{getValue()}</span>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant='outline'
                  className={cn(
                    'text-xs gap-x-1 dark:bg-[hsl(var(--background))]',
                    isActive ? '' : 'dark:text-gray-700 text-gray-300 dark:[&>svg]:text-gray-700 [&>svg]:text-gray-300',
                  )}>
                  <CommonIcon type={row.original.type.state} className='size-5' />
                </Badge>
              </TooltipTrigger>
              <TooltipContent side='left' className='capitalize flex gap-x-2'>
                <span>{row.original.type.state}</span>
                {/*<span className='capitalize'>{Unit[displayUnit].longName}</span>*/}
              </TooltipContent>
            </Tooltip>
          </div>
        )
      },
      footer: () => <div className='text-left px-4'>Total</div>,
      meta: {
        displayAs: 'Name',
        cellClass: cellClassActiveInActive,
        headerClass: () => 'px-4',
      },
    }),
    ...generateActivityColDef(listOfYearsAndMonths),
    columnHelper.accessor('groupByName', {
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      meta: {
        displayAs: 'Group By',
        headerClass: 'px-4',
        cellClass: flow(cellClassActiveInActive, (str) => str + ' px-4'),
      },
    }),
    columnHelper.display({
      id: 'actions',
      maxSize: 50,
      enablePinning: true,
      cell: ({ row }) => <RowActions row={row} />,
      meta: { cellClass: 'px-2' },
    }),
  ]
}
