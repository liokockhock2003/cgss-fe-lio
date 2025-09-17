import { AlertDeleteDialog } from '@/components/AlertDeleteDialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { q$ } from '@/store'
import { useCan } from '@/utilities/use-can'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { DefaultError, useMutation } from '@tanstack/react-query'
import { Row } from '@tanstack/react-table'
import { Ellipsis } from 'lucide-react'
import { BusinessTravelApi } from './api.ts'
import { DialogBusinessTravel } from './form/DialogBusinessTravel.tsx'

interface TableRowActionsProps<TData extends { id: number }> {
  row: Row<TData>
}

export function TableRowActions<TData extends { id: number, groupById: number }>({ row }: TableRowActionsProps<TData>) {
  const canUpdate = useCan({ permission: 'scope3.business-travel.update', groupById: row.original.groupById })
  const canDelete = useCan({ permission: 'scope3.business-travel.delete', groupById: row.original.groupById })
  const hasAnyPermission = canUpdate || canDelete

  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{
    action: { id: number; type: 'edit' | 'duplicate' }
    deleteId: number
  }>({
    action: undefined,
    deleteId: undefined,
  })

  const deleteMutation = useMutation<unknown, DefaultError, { id: number }>(
    BusinessTravelApi.main.mutationOption({
      type: 'delete',
      onSuccess: () => q$.invalidateQuery(BusinessTravelApi.main.optimized.qk()),
    }),
  )

  const handleAction = (action: 'edit' | 'duplicate') => () => {
    handleOpenChangeWith('action', { id: row.original.id, type: action })
  }


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={!hasAnyPermission}>
          <Button variant='ghost' className='flex h-8 w-8 p-0 data-[state=open]:bg-muted' disabled={!hasAnyPermission}>
            <Ellipsis className='h-4 w-4' />
            <span className='sr-only'>Open action</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          {canUpdate && (
            <DropdownMenuItem onSelect={handleAction('edit')}>Edit</DropdownMenuItem>
          )}
          {canUpdate && (
            <DropdownMenuItem onSelect={handleAction('duplicate')}>Duplicate</DropdownMenuItem>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleOpenChangeWith('deleteId', row.original.id)}>Delete</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {popoverStates.deleteId === row.original.id && (
        <AlertDeleteDialog
          mutation={deleteMutation}
          onClose={() => handleOpenChangeWith('deleteId', undefined)}
          handleDelete={async () => {
            await deleteMutation.mutateAsync({ id: popoverStates.deleteId })
            handleOpenChangeWith('deleteId', false)
          }}
        />
      )}

      {popoverStates.action ?
        <DialogBusinessTravel data={popoverStates.action} onClose={handleOpenChangeWith('action')} />
      : null}
    </>
  )
}
