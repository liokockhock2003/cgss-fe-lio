import { AlertDeleteDialog } from '@/components/AlertDeleteDialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { q$ } from '@/store'
import type { MobileRegistryResponse } from '@/store/query/mobile-registry.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { useMutation } from '@tanstack/react-query'
import { Pencil, Trash } from 'lucide-react'
import { MobileRegistryForm } from './Form.tsx'

export function RowAction<TData extends MobileRegistryResponse>({ row }: { row: TData }) {
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ edit: TData; deleteId: number }>({
    deleteId: undefined,
    edit: undefined,
  })
  const deleteMutation = useMutation(q$.General.MobileRegistryQuery.mutationOption({ type: 'delete' }))

  return (
    <>
      <div className='flex justify-center h-full w-full items-center'>
        <Tooltip>
          <TooltipTrigger asChild onClick={() => handleOpenChangeWith('edit', row)}>
            <Button variant='ghost' size='icon'>
              <Pencil />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left'>Edit</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild onClick={() => handleOpenChangeWith('deleteId', row.id)}>
            <Button variant='ghost' size='icon'>
              <Trash className='size-5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left'>Delete</TooltipContent>
        </Tooltip>
      </div>

      {popoverStates.edit && (
        <MobileRegistryForm payload={popoverStates.edit} onClose={() => handleOpenChangeWith('edit', false)} />
      )}

      {popoverStates.deleteId && (
        <AlertDeleteDialog
          mutation={deleteMutation}
          description='This action will also delete all data that is using this mobile registry'
          onClose={() => handleOpenChangeWith('deleteId', undefined)}
          handleDelete={async () => {
            await deleteMutation.mutateAsync({ id: popoverStates.deleteId })
            handleOpenChangeWith('deleteId', undefined)
          }}
        />
      )}
    </>
  )
}
