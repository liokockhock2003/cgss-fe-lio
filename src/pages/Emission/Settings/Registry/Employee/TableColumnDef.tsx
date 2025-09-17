import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { cellClassActiveInActive } from '@/components/tanstack-table/utils.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import type { EmployeeRegistryResponse } from '@/store/query/employee-registry.ts'
import { cn } from '@/utilities/cn.ts'
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table'
import { RowAction } from './TableRowActions'

const columnHelper = createColumnHelper<EmployeeRegistryResponse>()

export const tableColumnDef: ColumnDef<EmployeeRegistryResponse>[] = [
  columnHelper.accessor('name', {
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap p-4'>{getValue()}</div>,
    meta: {
      displayAs: 'Employee Name',
      cellClass: cellClassActiveInActive,
    },
  }),

  columnHelper.accessor('staffId', {
    enableSorting: true,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ getValue }) => <div className='whitespace-nowrap p-4'>{getValue()}</div>,
    meta: { displayAs: 'Staff ID', cellClass: cellClassActiveInActive },
  }),

  columnHelper.group({
    id: 'info',
    enableSorting: false,
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    meta: { displayAs: 'Info that will be push to Scope3 Employee Commuting Activities', headerClass: 'px-2' },
    columns: [
      columnHelper.accessor('addressFrom', {
        enableSorting: true,
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ getValue }) => <div className='whitespace-nowrap p-4'>{getValue()}</div>,
        meta: { displayAs: 'Address From', cellClass: cellClassActiveInActive },
      }),

      columnHelper.accessor('addressTo', {
        enableSorting: true,
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ getValue }) => <div className='whitespace-nowrap p-4'>{getValue()}</div>,
        meta: { displayAs: 'Address To', cellClass: cellClassActiveInActive },
      }),

      columnHelper.accessor('distance', {
        enableSorting: true,
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ getValue }) => <div className='whitespace-nowrap px-4 text-right tabular-nums'>{getValue()}</div>,
        meta: { displayAs: 'Distance (km)', cellClass: cellClassActiveInActive },
      }),

      columnHelper.accessor('avg_day_working_per_month', {
        enableSorting: true,
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ getValue }) => <div className='whitespace-nowrap px-4 text-right tabular-nums'>{getValue()}</div>,
        meta: { displayAs: 'Ave Day working Monthly', cellClass: cellClassActiveInActive },
      }),

      columnHelper.accessor('EF_MobileCombustionDistanceId', {
        enableSorting: true,
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ getValue }) => <div className='whitespace-nowrap p-4'>{getValue()}</div>,
        meta: { displayAs: 'Vehicle', cellClass: cellClassActiveInActive },
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
    meta: { displayAs: 'Status', cellClass: ({ row }) => cn(cellClassActiveInActive({ row }), 'px-4') },
  }),

  columnHelper.display({
    id: 'actions',
    maxSize: 50,
    enablePinning: true,
    cell: ({ row }) => <RowAction row={row.original} />,
    meta: { cellClass: 'px-2' },
  }),
]
