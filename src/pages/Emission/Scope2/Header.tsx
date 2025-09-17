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
import { DialogType } from './DialogType.tsx'
import { useScope2 } from './context.tsx'

Scope2Header.displayName = 'Scope2 Header'
export function Scope2Header() {
  const { table, query } = useScope2()
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ create: boolean }>({ create: undefined })
  const canCreate = useCan({ permission: 'scope2.scope2.create' })
  const addNew = () => handleOpenChangeWith('create', true)

  return (
    <>
      <CardHeader
        className='flex flex-row items-center gap-2 @container/header space-y-0'
        style={{ contain: 'layout' }}>
        <div className='flex items-center mr-auto'>
          <SearchInput placeholder='Search category...' />
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
                Add new type
              </DropdownMenuItem>
            )}

            <TableColumnView view='dropdown-item' table={table} />
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='items-center gap-x-2 hidden @xl/header:flex'>
          <ReloadQuery query={query} />

          {canCreate && (
            <Button variant='secondary' onClick={addNew}>
              Add new type
            </Button>
          )}

          <TableColumnView table={table} />
        </div>
      </CardHeader>

      {popoverStates.create ?
        <DialogType type='create' onClose={() => handleOpenChangeWith('create', undefined)} />
      : null}
    </>
  )
}
