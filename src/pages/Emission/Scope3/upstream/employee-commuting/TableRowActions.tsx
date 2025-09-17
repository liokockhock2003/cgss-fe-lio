import { AlertDeleteDialog } from '@/components/AlertDeleteDialog.tsx'
import { AlertStatusDialog } from '@/components/AlertStatusDialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { q$ } from '@/store'
import { useCan } from '@/utilities/use-can'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { useMutation } from '@tanstack/react-query'
import { Row } from '@tanstack/react-table'
import { noop } from 'lodash-es'
import { EllipsisVertical, PencilIcon, Shield, ShieldOff, Trash } from 'lucide-react'
import { DialogEmployeeName } from './DialogEmployeeName.tsx'
import { EmployeeCommutingApi, TEmployeeCommuting } from './api.ts'
import { useEmployeeCommuting } from './context.tsx'

RowActions.displayName = 'EmployeeCommuting RowActions'
export function RowActions({ row }: { row: Row<TEmployeeCommuting['main']['base']> }) {
  const { queryKey } = useEmployeeCommuting()
  const canUpdate = useCan({ permission: 'scope3.employee-commuting.update', groupById: row.original.groupById })
  const canDelete = useCan({ permission: 'scope3.employee-commuting.delete', groupById: row.original.groupById })
  const hasAnyPermission = canUpdate || canDelete

  const { popoverStates, handleOpenChangeWith } = usePopoverStates<
    Partial<{
      deleteId: number
      edit: TEmployeeCommuting['main']['base']
      status: 'active' | 'inactive'
    }>
  >({ deleteId: undefined, edit: undefined, status: undefined })

  const editMutation = useMutation(
    EmployeeCommutingApi.main.mutationOption({
      type: 'edit',
      toastMsg: 'Status Updated',
      onSuccess: () => {
        handleOpenChangeWith('deleteId', false)
        q$.invalidateQuery([...queryKey])
      },
    }),
  )

  const deleteMutation = useMutation(
    EmployeeCommutingApi.main.mutationOption({
      type: 'delete',
      onSuccess: () => {
        handleOpenChangeWith('deleteId', false)
        q$.invalidateQuery([...queryKey])
      },
    }),
  )

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
              <DropdownMenuItem>
                {row.original.status === 'active' ?
                  <div className='flex items-center gap-2' onClick={() => handleOpenChangeWith('status', 'inactive')}>
                    <ShieldOff className='h-4 w-4' />
                    <p>
                      Set type to <b>inactive</b>
                    </p>
                  </div>
                : <div className='flex items-center gap-2' onClick={() => handleOpenChangeWith('status', 'active')}>
                    <Shield className='h-4 w-4' />
                    <p>
                      Set type to <b>active</b>
                    </p>
                  </div>
                }
              </DropdownMenuItem>
            )}

            {canUpdate && (
              <DropdownMenuItem onSelect={() => handleOpenChangeWith('edit', row.original)}>
                <PencilIcon className='mr-2 size-4' />
                Edit
              </DropdownMenuItem>
            )}

            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleOpenChangeWith('deleteId', row.original.id)}>
                  <Trash className='mr-2 size-4' />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {popoverStates.status ?
        <AlertStatusDialog
          mutation={editMutation}
          statusAction={popoverStates.status}
          onClose={() => {
            handleOpenChangeWith('status', undefined)
            editMutation.reset()
          }}
          handleStatus={async () => {
            try {
              await editMutation.mutateAsync({ id: row.original.id, status: popoverStates.status })
              handleOpenChangeWith('status', undefined)
            } catch (e) {
              noop()
            }
          }}
        />
      : null}

      {popoverStates.edit ?
        <DialogEmployeeName
          type='edit'
          data={popoverStates.edit as unknown as never}
          onClose={() => handleOpenChangeWith('edit', undefined)}
        />
      : null}

      {popoverStates.deleteId ?
        <AlertDeleteDialog
          mutation={deleteMutation}
          onClose={() => handleOpenChangeWith('deleteId', undefined)}
          handleDelete={async () => await deleteMutation.mutateAsync({ id: popoverStates.deleteId })}
        />
      : null}
    </>
  )
}
