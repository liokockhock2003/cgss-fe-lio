import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { Column, Table } from '@tanstack/react-table'
import { Eye } from 'lucide-react'

function tableColumnView<T>(cols: Column<T>[]) {
  return cols
    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
    .map((column) => {
      const label =
        (column.columnDef.meta as { displayAs?: string })?.displayAs ??
        column.id ??
        'something wrong, please set meta.displayAs in columnDefs'

      return (
        <DropdownMenuCheckboxItem
          key={column.id}
          className='capitalize'
          checked={column.getIsVisible()}
          onClick={(e) => {
            column.toggleVisibility(!column.getIsVisible())
            e.preventDefault()
          }}>
          {label}
        </DropdownMenuCheckboxItem>
      )
    })
}

export function TableColumnView<T>({
  view = 'normal',
  table,
  colStrategy = 'getAllColumns',
}: {
  colStrategy?: 'getAllFlatColumns' | 'getAllColumns'
  view?: 'normal' | 'dropdown-item'
  table: Table<T>
}) {
  const cols = table[colStrategy]()
  const ColumnVisibilities = tableColumnView(cols)

  return view === 'dropdown-item' ?
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <div className='flex gap-4 items-center'>
            <Eye className='size-4' />
            <span>View</span>
          </div>
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>{ColumnVisibilities}</DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    : <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='ml-auto hidden lg:flex'>
            <Eye className='h-5 w-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className=''>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ColumnVisibilities}
        </DropdownMenuContent>
      </DropdownMenu>
}
