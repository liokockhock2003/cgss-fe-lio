import { Button } from '@/components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { type CompanyInfoResponse } from '@/store/query/company-info.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { Pencil, Trash } from 'lucide-react'
import { CompanyInfoForm } from './Form.tsx'

export function RowAction<TData extends CompanyInfoResponse>({ row }: { row: TData }) {
  // const deleteMutation = useMutation(CompanyInfoQuery.mutationOption({ type: 'delete' }))
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ edit: TData; deleteId: number }>({
    deleteId: undefined,
    edit: undefined,
  })

  return (
    <>
      <div className='flex justify-center flex-col h-full w-full items-center px-4'>
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
        <CompanyInfoForm payload={popoverStates.edit} onClose={() => handleOpenChangeWith('edit', false)} />
      )}

      {/*{popoverStates.deleteId && (*/}
      {/*  <AlertDeleteDialog*/}
      {/*    mutation={deleteMutation}*/}
      {/*    description='asdasd'*/}
      {/*    onClose={() => handleOpenChangeWith('deleteId', undefined)}*/}
      {/*    handleDelete={async () => {*/}
      {/*      await deleteMutation.mutateAsync({ id: popoverStates.deleteId })*/}
      {/*      handleOpenChangeWith('deleteId', undefined)*/}
      {/*    }}*/}
      {/*  />*/}
      {/*)}*/}
    </>
  )
}
