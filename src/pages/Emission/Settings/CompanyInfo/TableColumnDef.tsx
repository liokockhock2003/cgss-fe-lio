import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { CompanyInfoResponse } from '@/store/query/company-info.ts'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { format } from 'date-fns'
import { RowAction } from './TableRowActions'

const columnHelper = createColumnHelper<CompanyInfoResponse>()

export const tableColumnDef: ColumnDef<CompanyInfoResponse>[] = [
  columnHelper.accessor('name', {
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue, row }) => (
      <div className='whitespace-nowrap p-4'>
        {getValue()} ({row.original.slug})
      </div>
    ),
    meta: { displayAs: 'Name (slug)' },
  }),

  columnHelper.accessor('features', {
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => (
      <div className='whitespace-nowrap p-4 flex gap-x-1'>
        {getValue().length ?
          getValue().map((v, i) => (
            <Badge key={i} variant='default' className='text-xs'>
              {v}
            </Badge>
          ))
        : 'n/a'}
      </div>
    ),
    meta: { displayAs: 'Features', headerClass: 'px-4' },
  }),

  columnHelper.accessor('addresses', {
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => (
      <ol className='whitespace-nowrap p-4 flex flex-col gap-x-1'>
        {getValue().length ?
          getValue().map((v, i) => (
            <li key={i} className='text-xs'>
              {v}
            </li>
          ))
        : 'n/a'}
      </ol>
    ),
    meta: { displayAs: 'Addresses', headerClass: 'px-4' },
  }),

  columnHelper.accessor('expiredAt', {
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => (
      <div className='whitespace-nowrap p-4'>{getValue() ? format(getValue(), 'yyyy-MM-dd') : 'n/a'}</div>
    ),
    meta: { displayAs: 'Expired At' },
  }),

  columnHelper.display({
    id: 'Contact Info',
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => {
      const data = row.original
      return data ?
          <div>
            {data.contactInfo.name}, {data.contactInfo.email}, {data.contactInfo.contactNo}
          </div>
        : 'n/a'
    },
    meta: { displayAs: 'Address From', cellClass: 'p-4', headerClass: 'px-4' },
  }),

  columnHelper.group({
    id: 'meta',
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    meta: { displayAs: 'Metadata', headerClass: 'px-2' },
    columns: [
      columnHelper.accessor('metadata.maxGroups', {
        enableSorting: true,
        enableHiding: true,
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => (
          <div className='whitespace-nowrap p-4'>{row.original.metadata?.maxGroups ?? 'Infinity'}</div>
        ),
        meta: { displayAs: 'Max Groups' },
      }),

      columnHelper.accessor('metadata.financialYearStartMonth', {
        enableSorting: true,
        enableHiding: true,
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => (
          <div className='whitespace-nowrap p-4'>{row.original.metadata?.financialYearStartMonth ?? 1}</div>
        ),
        meta: { displayAs: 'Financial Start Month at (default Jan)' },
      }),

      columnHelper.accessor('metadata.icon', {
        enableSorting: true,
        enableHiding: true,
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => <div className='whitespace-nowrap p-4'>{row.original.metadata?.icon ?? 'n/a'}</div>,
        meta: { displayAs: 'Icon/Picture' },
      }),
    ],
  }),

  columnHelper.accessor('status', {
    enableSorting: true,
    maxSize: 50,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => {
      const isActive = getValue() === 'active'
      return (
        <div className='grid grid-cols-[max-content_1fr] gap-2 items-center justify-center'>
          <Switch id='status' checked={isActive} disabled />
          <p>{isActive ? 'Active' : 'Inactive'}</p>
        </div>
      )
    },
    meta: { displayAs: 'Status', cellClass: 'px-4' },
  }),
  columnHelper.display({
    id: 'actions',
    maxSize: 100,
    enablePinning: true,
    cell: ({ row }) => <RowAction row={row.original} />,
    meta: { cellClass: 'px-2' },
  }),
]
