import { AlertDeleteDialog } from '@/components/AlertDeleteDialog.tsx'
import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { q$ } from '@/store'
import { EmployeeRegistryQuery, EmployeeRegistryResponse } from '@/store/query/employee-registry.ts'
import { queryClient } from '@/store/query/query-client.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { useMutation } from '@tanstack/react-query'
import { Pencil, Trash } from 'lucide-react'
import { EmployeeRegistryForm } from './Form.tsx'

export function RowAction<TData extends EmployeeRegistryResponse>({ row }: { row: TData }) {
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ edit: TData; deleteId: number }>({
    deleteId: undefined,
    edit: undefined,
  })
  const deleteMutation = useMutation(q$.General.EmployeeRegistryQuery.mutationOption({ type: 'delete' }))

  const [tableQueries] = useTableQueries()
  const queryKey = [EmployeeRegistryQuery.uniqueKey, tableQueries] as const

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
        <EmployeeRegistryForm
          queryKey={queryKey}
          payload={popoverStates.edit}
          onClose={() => handleOpenChangeWith('edit', false)}
        />
      )}

      {popoverStates.deleteId && (
        <AlertDeleteDialog
          mutation={deleteMutation}
          description='This action will also delete all data that is using this employee registry'
          onClose={() => handleOpenChangeWith('deleteId', undefined)}
          handleDelete={async () => {
            await deleteMutation.mutateAsync({ id: popoverStates.deleteId })
            handleOpenChangeWith('deleteId', undefined)
            await queryClient.invalidateQueries({ queryKey })
          }}
        />
      )}
    </>
  )
}
