import { CellActivities, CellActivityHeader } from '@/components/tanstack-table/cell/cell-activities.tsx'
import { FooterTotalActivities, FooterTotalHeader } from '@/components/tanstack-table/cell/cell-footer.tsx'
import { CellTotal, CellTotalHeader } from '@/components/tanstack-table/cell/cell-total.tsx'
import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { cellClassActiveInActive } from '@/components/tanstack-table/utils.tsx'
import { cn } from '@/utilities/cn.ts'
import type { GenerateListOfYearsAndMonths } from '@/utilities/table-activity-transformer.ts'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { flow } from 'lodash-es'
import { DialogActivity } from './Activities/Dialog.tsx'
import { RowActions } from './TableRowActions.tsx'
import type { TProcessEmission } from './api.ts'

const columnHelper = createColumnHelper<TProcessEmission['main']['base']>()

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
          footer: ({ table }) => <FooterTotalHeader table={table as never} />,
          meta: { cellClass: cellClassActiveInActive },
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
): ColumnDef<TProcessEmission['main']['base']>[] => {
  return [
    columnHelper.accessor('category', {
      enableSorting: true,
      enablePinning: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ getValue }) => <div className='whitespace-nowrap p-4'>{getValue()}</div>,
      footer: () => <div className='text-left px-4'>Total</div>,
      meta: {
        displayAs: 'Category',
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
