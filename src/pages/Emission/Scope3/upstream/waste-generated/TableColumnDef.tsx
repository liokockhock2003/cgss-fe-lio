import { Loading2 } from '@/components/Loading.tsx'
import { CellActivities, CellActivityHeader } from '@/components/tanstack-table/cell/cell-activities.tsx'
import { FooterTotalActivities, FooterTotalHeader } from '@/components/tanstack-table/cell/cell-footer.tsx'
import { CellTotal, CellTotalHeader } from '@/components/tanstack-table/cell/cell-total.tsx'
import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { cellClassActiveInActive } from '@/components/tanstack-table/utils.tsx'
import { cn } from '@/utilities/cn.ts'
import { inActiveClass } from '@/utilities/formatter.ts'
import type { GenerateListOfYearsAndMonths } from '@/utilities/table-activity-transformer.ts'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { X } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { DialogActivity } from './Activities/Dialog.tsx'
import { RowActions } from './TableRowActions.tsx'
import type { TWasteGenerated } from './api.ts'

const columnHelper = createColumnHelper<TWasteGenerated['main']['base']>()

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
          const currentYearMonthClass = currentYearMonth === `${year}.${month}` ? 'bg-muted/40' : ''

          return columnHelper.accessor(accessorKey, {
            id: `${year}-${month}`,
            header: () => <CellActivityHeader month={month - 1} year={year} />,
            cell: (info) => (
              <ErrorBoundary fallback={<X className='size-4 w-full text-red-500 flex items-center' />}>
                <Suspense fallback={<Loading2 className='h-4 w-4' />}>
                  <CellActivities info={info} accessorKey={accessorKey}>
                    {(props) => <DialogActivity {...props} />}
                  </CellActivities>
                </Suspense>
              </ErrorBoundary>
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
): ColumnDef<TWasteGenerated['main']['base']>[] => {
  return [
    columnHelper.accessor('category', {
      id: 'category',
      enableSorting: true,
      enablePinning: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ getValue, row }) => (
        <div className='whitespace-nowrap flex flex-col p-4'>
          <div className='flex gap-x-1'>
            {row.original.materialIdHuman}
            <span className='text-muted-foreground'>{row.original.methodHuman}</span>
          </div>
          <span className='text-muted-foreground'> {getValue()} </span>
        </div>
      ),
      footer: () => <div className='text-left px-4'>Total</div>,
      meta: {
        displayAs: 'Category',
        cellClass: cellClassActiveInActive,
        headerClass: () => 'px-4',
      },
    }),
    columnHelper.accessor('type', {
      id: 'type',
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ getValue }) => {
        const value = getValue()
        if (value === 'waste_type_specific_method') return 'Waste Type Specific'
        return 'Supplier Specific'
      },
      size: 200,
      meta: {
        displayAs: 'Method',
        headerClass: 'px-4',
        // cellClass: 'px-4',
        cellClass: ({ row }) => 'px-4 ' + (row.original.status === 'inactive' ? inActiveClass : ''),
      },
    }),
    ...generateActivityColDef(listOfYearsAndMonths),
    columnHelper.accessor('groupBy.name', {
      id: 'groupBy.name',
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      meta: {
        displayAs: 'Group By',
        headerClass: 'px-4',
        cellClass: 'px-4',
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
