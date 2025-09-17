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
import { EllipsisVertical, Plus } from 'lucide-react'
import { useBusinessTravel } from './context.tsx'
import { DialogBusinessTravel } from './form/DialogBusinessTravel.tsx'

BusinessTravelHeader.displayName = 'BusinessTravel Header'
export function BusinessTravelHeader() {
  const { table, query } = useBusinessTravel()
  const { popoverStates, handleOpenChangeWith } = usePopoverStates({ create: false })
  const canCreate = useCan({ permission: 'scope3.business-travel.create' })

  return (
    <>
      <CardHeader
        className='flex flex-row items-center gap-2 flex-wrap @container/header space-y-0'
        style={{ contain: 'layout' }}>
        <div className='flex items-center mr-auto'>
          <SearchInput placeholder='Search travel purpose or desc...' />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='icon' className='@lg/header:hidden mt-0!'>
              <EllipsisVertical className='size-5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <ReloadQuery view='dropdown-item' query={query} />

            {canCreate && (
              <DropdownMenuItem className='flex gap-4' onSelect={() => handleOpenChangeWith('create', true)}>
                <Plus className='size-4' />
                Add new Business Travel
              </DropdownMenuItem>
            )}

            <TableColumnView view='dropdown-item' table={table} />
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='items-center gap-x-2 hidden @lg/header:flex'>
          <ReloadQuery query={query} />

          {canCreate && (
            <Button variant='secondary' onClick={() => handleOpenChangeWith('create', true)}>
              Add new Business Travel
            </Button>
          )}

          <TableColumnView table={table} />
        </div>
      </CardHeader>

      {popoverStates.create ?
        <DialogBusinessTravel onClose={handleOpenChangeWith('create')} />
      : null}
    </>
  )
}
