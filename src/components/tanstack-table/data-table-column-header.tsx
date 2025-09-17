import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { cn } from '@/utilities/cn.ts'
import { Column } from '@tanstack/react-table'
import { ArrowDownIcon, ArrowUpDown, ArrowUpIcon, EyeOff } from 'lucide-react'
import { HTMLAttributes } from 'react'

interface DataTableColumnHeaderProps<TData, TValue> extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
}

export function DataTableColumnHeader<TData, TValue>({ column, className }: DataTableColumnHeaderProps<TData, TValue>) {
  const label =
    (column.columnDef.meta as { displayAs?: string })?.displayAs ??
    column.id ??
    'something wrong, please set meta.displayAs in columnDefs'

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{label}</div>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 data-[state=open]:bg-accent gap-x-2 cursor-pointer'>
          <span>{label}</span>
          {column.getIsSorted() === 'desc' ?
            <ArrowDownIcon className='h-4 w-4' />
          : column.getIsSorted() === 'asc' ?
            <ArrowUpIcon className='h-4 w-4' />
          : <ArrowUpDown className=' h-4 w-4 ' />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuItem
          onClick={() => {
            if (column.getIsSorted() === 'asc') column.clearSorting()
            else column.toggleSorting(false)
          }}>
          <ArrowUpIcon
            className={cn('mr-2 h-3.5 w-3.5 ', column.getIsSorted() === 'asc' ? '' : 'text-muted-foreground/70')}
          />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            if (column.getIsSorted() === 'desc') column.clearSorting()
            else column.toggleSorting(true)
          }}>
          <ArrowDownIcon
            className={cn('mr-2 h-3.5 w-3.5 ', column.getIsSorted() === 'desc' ? '' : 'text-muted-foreground/70')}
          />
          Desc
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
          <EyeOff className='mr-2 h-4 w-4' />
          Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
