import { ReloadQuery } from '@/components/ReloadQuery.tsx'
import { SearchInput } from '@/components/SearchInput.tsx'
import { TableColumnView } from '@/components/tanstack-table/table-column-view.tsx'
import { Button } from '@/components/ui/button.tsx'
import { CardHeader } from '@/components/ui/card.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { useCan } from '@/utilities/use-can'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { EllipsisVertical, ExternalLink, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DialogEmployeeName } from './DialogEmployeeName.tsx'
import { useEmployeeCommuting } from './context.tsx'

EmployeeCommutingHeader.displayName = 'EmployeeCommutingHeader'
export function EmployeeCommutingHeader() {
  const { table, query } = useEmployeeCommuting()
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ create: boolean }>({ create: undefined })
  const canCreate = useCan({ permission: 'scope3.employee-commuting.create' })
  const addNew = () => handleOpenChangeWith('create', true)

  return (
    <>
      <CardHeader
        className='flex flex-row items-center gap-2 @container/header space-y-0'
        style={{ contain: 'layout' }}>
        <div className='flex items-center mr-auto'>
          <SearchInput placeholder='Search employee name or staffId...' />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='icon' className='@xl/header:hidden mt-0!'>
              <EllipsisVertical className='size-5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <ReloadQuery view='dropdown-item' query={query} />

            {canCreate && (
              <DropdownMenuItem className='flex gap-4' onSelect={addNew}>
                <Plus className='size-4' />
                Add employee
              </DropdownMenuItem>
            )}

            <TableColumnView view='dropdown-item' table={table} />
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='items-center gap-x-2 hidden @xl/header:flex'>
          <ReloadQuery query={query} />

          {canCreate && (
            <Button variant='secondary' onClick={addNew}>
              Add employee
            </Button>
          )}

          <TableColumnView table={table} />

          <Button className='flex gap-x-2 items-center' asChild variant='secondary'>
            <Link to='/emission/settings/company-registry/employee'>
              <ExternalLink className='size-5' />
              Employee Registry
            </Link>
          </Button>
        </div>
      </CardHeader>

      {popoverStates.create ?
        <DialogEmployeeName type='create' onClose={() => handleOpenChangeWith('create', undefined)} />
      : null}
    </>
  )
}
