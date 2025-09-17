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
import { useModal } from '@/utilities/useModal.tsx'
import { EllipsisVertical, ExternalLink, Plus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useUdtd } from './context.tsx'
import { DialogUdtd } from './form/DialogUdtd.tsx'

Header.displayName = 'Udtd Header'
export function Header() {
  const { table, query, queryKey } = useUdtd()
  const { openModal } = useModal()
  const location = useLocation()
  const isUpstream = location.pathname.includes('upstream-transportation-distribution')
  const canCreate = useCan({ permission: 'scope3.upstream-downstream-transportation-and-distribution.create' })

  const addNew = () => openModal(DialogUdtd.modalId, { type: 'create', payload: undefined })

  return (
    <CardHeader className='flex flex-row items-center gap-2 @container/header space-y-0' style={{ contain: 'layout' }}>
      <div className='flex items-center mr-auto'>
        <SearchInput placeholder='Search name or desc...' />
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
              <div>
                Add new <span className='capitalize ml-1'>{queryKey[2].type}</span>
              </div>
            </DropdownMenuItem>
          )}

          <TableColumnView view='dropdown-item' table={table} />

          <DropdownMenuItem className='flex gap-4'>
            <ExternalLink className='size-4' />

            {isUpstream ?
              <Link to='/emission/scope3/downstream/downstream-transportation-distribution'>Downstream</Link>
            : <Link to='/emission/scope3/upstream/upstream-transportation-distribution'>UpStream</Link>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className='items-center gap-x-2 hidden @xl/header:flex'>
        <ReloadQuery query={query} />

        {canCreate && (
          <Button variant='secondary' className='gap-x-1' onClick={addNew}>
            Add new <span className='capitalize'>{queryKey[2].type}</span>
          </Button>
        )}

        <TableColumnView table={table} />

        <Button className='flex gap-x-2 items-center' asChild variant='secondary'>
          {isUpstream ?
            <Link to='/emission/scope3/downstream/downstream-transportation-distribution'>
              <ExternalLink className='size-5' />
              Downstream
            </Link>
          : <Link to='/emission/scope3/upstream/upstream-transportation-distribution'>
              <ExternalLink className='size-5' />
              UpStream
            </Link>
          }
        </Button>
      </div>
    </CardHeader>
  )
}
