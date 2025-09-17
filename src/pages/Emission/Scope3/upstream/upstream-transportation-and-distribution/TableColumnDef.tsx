import { ChemicalSymbol } from '@/components/common-icon.tsx'
import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { cellClassActiveInActive } from '@/components/tanstack-table/utils.tsx'
import { valueFormatter } from '@/utilities/formatter.ts'
import { shortIt } from '@/utilities/to-humanize-digits.ts'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { format } from 'date-fns'
import Decimal from 'decimal.js'
import { flow } from 'lodash-es'
import { TableRowActions } from './TableRowAction.tsx'
import { TUdtd } from './api.ts'

const columnHelper = createColumnHelper<TUdtd['base']>()

export const tableColumnDef: ColumnDef<TUdtd['base']>[] = [
  columnHelper.accessor('name', {
    meta: { displayAs: 'Name', headerClass: 'px-2', cellClass: 'px-2' },
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap'>{getValue()}</div>,
  }),
  columnHelper.accessor('date', {
    meta: { displayAs: 'Date', headerClass: 'px-2', cellClass: 'px-2' },
    enableSorting: true,
    enableHiding: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap'>{format(getValue(), 'yyyy-MM-dd')}</div>,
  }),
  columnHelper.accessor('desc', {
    meta: { displayAs: 'Desc', headerClass: 'px-2', cellClass: 'px-2' },
    enableSorting: false,
    enableHiding: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap'>{shortIt(getValue())}</div>,
  }),
  columnHelper.accessor('co2e', {
    meta: { headerClass: 'px-2', cellClass: 'px-2' },
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
  columnHelper.accessor('metadata', {
    meta: { displayAs: 'Info', headerClass: 'px-2', cellClass: 'px-2' },
    enableSorting: false,
    enableHiding: true,
    maxSize: 100,
    header: ({ column }) => <DataTableColumnHeader column={column} className='whitespace-nowrap' />,
    cell: ({ getValue }) => {
      const metadata = getValue()

      return (
        <div className='flex flex-col'>
          <p className='text-nowrap'>{shortIt(metadata.addressFrom)}</p>
          <p className='text-nowrap'>{shortIt(metadata.addressTo)}</p>
          <p className='text-nowrap'>{metadata.distance}km</p>
        </div>
      )
    },
  }),
  columnHelper.accessor('metadata.displayAs', {
    meta: { displayAs: 'Vehicle Type', headerClass: 'px-2', cellClass: 'px-2' },
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} className='whitespace-nowrap' />,
  }),
  columnHelper.accessor('groupByName', {
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} className='whitespace-nowrap' />,
    meta: {
      displayAs: 'Group By',
      headerClass: 'px-2',
      cellClass: flow(cellClassActiveInActive, (str) => str + ' px-2'),
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
    meta: { headerClass: 'px-2', cellClass: 'px-2' },
  }),
]
