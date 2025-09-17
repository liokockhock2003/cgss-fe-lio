import { AlertDeleteDialog } from '@/components/AlertDeleteDialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { q$ } from '@/store'
import { GroupByQuery, GroupByResponse } from '@/store/query/group-by.ts'
import { queryClient } from '@/store/query/query-client.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { useMutation } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { ManageGroupByForm } from './Form.tsx'

export function RowAction<TData extends GroupByResponse>({ row }: { row: TData }) {
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ edit: TData; deleteId: number }>({ deleteId: undefined, edit: undefined, }) // prettier-ignore
  const deleteMutation = useMutation(q$.General.GroupByQuery.mutationOption({ type: 'delete' }))
  const queryKey = [GroupByQuery.uniqueKey]

  return (
    <>
      <div className='flex justify-center h-full w-full items-center'>
        <Tooltip>
          <TooltipTrigger asChild onClick={() => handleOpenChangeWith('edit', row)}>
            <Button variant='ghost' size='icon' className='manageGroup-edit'>
              <Pencil className='' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left'>Edit</TooltipContent>
        </Tooltip>

      {/*
       <Tooltip>
          <TooltipTrigger asChild onClick={() => handleOpenChangeWith('deleteId', row.id)}>
            <Button variant='ghost' size='icon' className='manageGroup-delete'>
              <Trash className='size-5' />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='left'>Delete</TooltipContent>
        </Tooltip>
        */}
      </div>

      {popoverStates.edit && (
        <ManageGroupByForm
          queryKey={queryKey} // hack for now
          payload={popoverStates.edit}
          onClose={() => handleOpenChangeWith('edit', false)}
        />
      )}

      {popoverStates.deleteId && (
        <AlertDeleteDialog
          mutation={deleteMutation}
          description='This action will also delete all data that is using this group'
          onClose={() => handleOpenChangeWith('deleteId', undefined)}
          handleDelete={async () => {
            await deleteMutation.mutateAsync({ id: popoverStates.deleteId })
            await queryClient.invalidateQueries({ queryKey })

            handleOpenChangeWith('deleteId', undefined)
          }}
        />
      )}
    </>
  )
}
