import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { TableRowActions } from './TableRowActions.tsx'
import type { TUserGroupByMap } from './api.ts'

const columnHelper = createColumnHelper<TUserGroupByMap['main']['base']>()

export const tableColumnDef = (): ColumnDef<TUserGroupByMap['main']['base']>[] => {
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
    columnHelper.display({
      id: 'user',
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <div className='p-4'>
          <div className='flex flex-col gap-1'>
            {row.original.user?.name && (
              <span className='font-medium'>
                {row.original.user.name}
              </span>
            )}
            {row.original.user?.email && (
              <span className='text-sm text-muted-foreground'>
                {row.original.user.email}
              </span>
            )}
          </div>
        </div>
      ),
      meta: {
        displayAs: 'User',
        headerClass: () => 'px-4',
      },
    }),
    columnHelper.display({
      id: 'groupBy',
      enableSorting: true,
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <div className='p-4'>
          {row.original.groupBy?.name && (
            <span className='font-medium'>
              {row.original.groupBy.name}
            </span>
          )}
        </div>
      ),
      meta: {
        displayAs: 'Group By',
        headerClass: () => 'px-4',
      },
    }),
    columnHelper.display({
      id: 'actions',
      maxSize: 50,
      enablePinning: true,
      cell: ({ row }) => <TableRowActions row={row} />,
      meta: { cellClass: 'px-2' },
    }),
  ]
}
