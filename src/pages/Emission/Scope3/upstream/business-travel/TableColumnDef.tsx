import { ChemicalSymbol } from '@/components/common-icon.tsx'
import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { cellClassActiveInActive } from '@/components/tanstack-table/utils.tsx'
import { valueFormatter } from '@/utilities/formatter.ts'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { format } from 'date-fns'
import Decimal from 'decimal.js'
import { flow } from 'lodash-es'
import { TableRowActions } from './TableRowActions.tsx'
import { TBusinessTravelMain } from './api.ts'

type BusinessTravelMain = TBusinessTravelMain['base']
const columnHelper = createColumnHelper<BusinessTravelMain>()

export const tableColumnDefs: ColumnDef<BusinessTravelMain>[] = [
  columnHelper.accessor('purpose', {
    meta: { displayAs: 'Travel Purpose', headerClass: 'px-2', cellClass: 'p-4' },
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap'>{getValue()}</div>,
  }),
  columnHelper.accessor('date', {
    meta: { displayAs: 'Date', headerClass: 'px-2', cellClass: 'p-4' },
    enableSorting: true,
    enableHiding: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap'>{format(getValue(), 'yyyy-MM-dd')}</div>,
  }),
  columnHelper.accessor('desc', {
    meta: { displayAs: 'Description', headerClass: 'px-2', cellClass: 'p-4' },
    enableSorting: false,
    enableHiding: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => (
      <div className='whitespace-nowrap'>{getValue().length > 30 ? `${getValue().slice(0, 30)}...` : getValue()}</div>
    ),
  }),

  columnHelper.accessor('co2e', {
    meta: { headerClass: 'px-2', cellClass: 'p-4' },
    enableSorting: false,
    header: ({ table }) => {
      const total = table.getRowModel().rows.reduce((acc, cur) => acc.plus(cur.original.co2e), new Decimal(0))

      return (
        <div>
          {ChemicalSymbol('TONCO2E')} ({valueFormatter(total.toNumber())})
        </div>
      )
    },
    cell: ({ getValue }) => (
      <div className='w-full text-right whitespace-nowrap tabular-nums'>{valueFormatter(getValue())}</div>
    ),
  }),
  columnHelper.accessor('travelers', {
    meta: { displayAs: 'Travelers', headerClass: 'px-2', cellClass: 'p-4' },
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => {
      const grabFirstX = 5
      const joined = getValue().length > 0 ? getValue().slice(0, grabFirstX).join(', ') + ' ...' : '-'
      return <div className='whitespace-nowrap'>{joined}</div>
    },
  }),
  columnHelper.accessor('groupByName', {
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} className='whitespace-nowrap' />,
    meta: {
      displayAs: 'Group By',
      headerClass: 'px-2',
      cellClass: flow(cellClassActiveInActive, (str) => str + ' px-4'),
    },
  }),
  columnHelper.display({
    id: 'actions',
    maxSize: 50,
    enablePinning: true,
    cell: ({ row }) => (
      <div className='flex justify-center'>
        <TableRowActions row={row} />
      </div>
    ),
    meta: {
      headerClass: 'px-2',
      cellClass: 'p-4',
    },
  }),
]
