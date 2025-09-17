import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'

import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import type { Row } from '@tanstack/react-table'
import { EllipsisVertical, PencilIcon, Trash } from 'lucide-react'
import { DialogType } from './DialogType.tsx'
import { DialogDelete } from './DialogDelete.tsx'
import type { TPermission } from './api.ts'

interface RowActionsProps {
  row: Row<TPermission['main']['base']>
}

export function RowActions({ row }: RowActionsProps) {
  const canUpdate = true // useCan(({ permission: 'permissions.update' })
  const canDelete = true // useCan(({ permission: 'permissions.delete' })
  const hasAnyPermission = canUpdate || canDelete

  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{
    edit: boolean;
    delete: boolean
  }>({
    edit: undefined,
    delete: undefined
  })

  const data = row.original

  return (
    <>
      <div className='flex justify-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!hasAnyPermission}>
            <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted' disabled={!hasAnyPermission}>
              <EllipsisVertical className='size-4' />
              <span className='sr-only'>Open action</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className=''>
            {canUpdate && (
              <DropdownMenuItem onSelect={() => handleOpenChangeWith('edit', true)}>
                <PencilIcon className='mr-2 size-4' />
                Edit
              </DropdownMenuItem>
            )}

            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleOpenChangeWith('delete', true)}>
                  <Trash className='mr-2 size-4' />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {popoverStates.edit && (
        <DialogType
          type="edit"
          data={data}
          onClose={() => handleOpenChangeWith('edit', undefined)}
        />
      )}

      {popoverStates.delete && (
        <DialogDelete
          data={data}
          onClose={() => handleOpenChangeWith('delete', undefined)}
        />
      )}
    </>
  )
}
