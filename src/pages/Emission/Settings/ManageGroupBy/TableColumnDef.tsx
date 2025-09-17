import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { cellClassActiveInActive } from '@/components/tanstack-table/utils.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { GroupByResponse } from '@/store/query/group-by.ts'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { RowAction } from './TableRowActions'

const columnHelper = createColumnHelper<GroupByResponse>()

export const tableColumnDef: ColumnDef<GroupByResponse>[] = [
  columnHelper.display({
    id: 'No',
    cell: ({ row }) => <div className='flex justify-center h-full w-full items-center'>{row.index + 1}</div>,
    maxSize: 15,
    meta: { headerClass: 'px-4', cellClass: 'px-4 ' },
  }),
  columnHelper.accessor('name', {
    enableSorting: true,
    enablePinning: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap p-4'>{getValue()}</div>,
    meta: {
      displayAs: 'Group Name',
      cellClass: cellClassActiveInActive,
    },
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
