import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { MobileRegistryResponse } from '@/store/query/mobile-registry'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { RowAction } from './TableRowActions'

type TData = MobileRegistryResponse & { vehicle: string; fuel: string; litre: string }
const columnHelper = createColumnHelper<TData>()

export const tableColumnDef: ColumnDef<TData>[] = [
  columnHelper.accessor('identity_no', {
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap p-4'>{getValue()}</div>,
    meta: { displayAs: 'Identity No', headerClass: 'px-2' },
  }),

  columnHelper.accessor('model', {
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap p-4'>{getValue()}</div>,
    meta: { displayAs: 'Model', headerClass: 'px-4' },
  }),

  columnHelper.accessor('vehicle', {
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap p-4'>{getValue()}</div>,
    meta: { displayAs: 'Vehicle', headerClass: 'px-4' },
  }),

  columnHelper.accessor('fuel', {
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap p-4'>{getValue()}</div>,
    meta: { displayAs: 'Fuel', headerClass: 'px-4' },
  }),

  columnHelper.accessor('litre', {
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap p-4'>{getValue()}</div>,
    meta: { displayAs: 'Litre', headerClass: 'px-4' },
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
    maxSize: 50,
    enablePinning: true,
    cell: ({ row }) => <RowAction row={row.original} />,
    meta: { cellClass: 'px-2' },
  }),
]
