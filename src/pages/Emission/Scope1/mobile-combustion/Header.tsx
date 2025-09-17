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
import { DialogIdentityNo } from './DialogIdentityNo.tsx'
import { useMobileCombustion } from './context.tsx'

MobileCombustionHeader.displayName = 'MobileCombustion Header'
export function MobileCombustionHeader() {
  const { table, query } = useMobileCombustion()
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ create: boolean }>({ create: undefined })
  const canCreate = useCan({ permission: 'scope1.mobile-combustion.create' })

  const addNew = () => handleOpenChangeWith('create', true)

  return (
    <>
      <CardHeader
        className='flex flex-row items-center gap-2 @container/header space-y-0'
        style={{ contain: 'layout' }}>
        <div className='flex items-center mr-auto'>
          <SearchInput placeholder='Search name...' />
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
                Add new Identity No
              </DropdownMenuItem>
            )}

            <TableColumnView view='dropdown-item' table={table} />
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='items-center gap-x-2 hidden @xl/header:flex'>
          <ReloadQuery query={query} />

          {canCreate && (
            <Button variant='secondary' onClick={addNew}>
              Add new Identity No
            </Button>
          )}

          <TableColumnView table={table} />

          <Button className='flex gap-x-2 items-center' asChild variant='secondary'>
            <Link to='/emission/settings/company-registry/mobile-vehicle'>
              <ExternalLink className='size-5' />
              Mobile Registry
            </Link>
          </Button>
        </div>
      </CardHeader>

      {popoverStates.create ?
        <DialogIdentityNo type='create' onClose={() => handleOpenChangeWith('create', undefined)} />
      : null}
    </>
  )
}
