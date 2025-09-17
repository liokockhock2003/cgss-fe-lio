import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { RowActions } from './TableRowActions.tsx'
import type { TPermission } from './api.ts'

const columnHelper = createColumnHelper<TPermission['main']['base']>()

export const tableColumnDef = (): ColumnDef<TPermission['main']['base']>[] => {
  return [
    columnHelper.display({
      id: 'rowNumber',
      enablePinning: true,
      header: 'No.',
      cell: ({ row }) => (
        <div className='px-4 py-2 text-sm font-medium text-muted-foreground'>
          {row.index + 1}
        </div>
      ),
      meta: {
        headerClass: () => 'px-4',
        cellClass: 'px-4',
      },
      maxSize: 60,
    }),
    columnHelper.accessor('name', {
      enableSorting: true,
      enablePinning: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ getValue }) => (
        <div className='whitespace-nowrap p-4'>
          <code className='bg-muted px-2 py-1 rounded text-sm font-mono'>{getValue()}</code>
        </div>
      ),
      meta: {
        displayAs: 'Permission Name',
        headerClass: () => 'px-4',
      },
    }),
    columnHelper.accessor('description', {
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ getValue }) => (
        <div className='p-4 max-w-md'>
          <span className='text-muted-foreground'>{getValue() || '-'}</span>
        </div>
      ),
      meta: {
        displayAs: 'Description',
        headerClass: () => 'px-4',
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
