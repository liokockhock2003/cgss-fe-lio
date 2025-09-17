import { AlertDeleteDialog } from '@/components/AlertDeleteDialog'
import { Loading2 } from '@/components/Loading'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { EmissionFactoryQuery } from '@/store/query/emission-factor.ts'
import { cn } from '@/utilities/cn.ts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { NotebookTabs, Plus, Trash } from 'lucide-react'

export function ManageEmissionDialog() {
  const currentYear = new Date().getFullYear()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModal, setIsDeleteModal] = useState(false)
  const queryClient = useQueryClient()

  const query = useQuery({
    ...EmissionFactoryQuery.list()({ params: { filter: { fields: ['id', 'year'] } } }),
    staleTime: 10_000,
  })

  const doneMutation = async () => {
    setIsModalOpen(false)
    await queryClient.invalidateQueries({ queryKey: [EmissionFactoryQuery.uniqueKey] })
  }

  const yearMutation = useMutation(
    EmissionFactoryQuery.mutationOption({
      type: 'create',
      urlManipulation: (url) => url + '/add-year',
      onSuccess: () => doneMutation(),
    }),
  )

  const deleteMutation = useMutation(
    EmissionFactoryQuery.mutationOption({
      type: 'delete',
      onSuccess: () => doneMutation(),
    }),
  )

  const [min, max] = useMemo(() => {
    return (query?.data ?? []).reduce(
      (acc, current) => {
        acc[0] = Math.min(acc[0] ?? Number.MAX_SAFE_INTEGER, current.year)
        acc[1] = Math.max(acc[1] ?? Number.MIN_SAFE_INTEGER, current.year)

        return acc
      },
      [] as unknown as [number, number],
    )
  }, [query.data])

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button disabled={query.isLoading}>
            {query.isLoading && <Loading2 className='text-current h-5 w-5 transition-all mr-2' />}
            <NotebookTabs className='size-5 mr-2' />
            Manage Emission
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Emission</DialogTitle>
            <DialogDescription>Please be extra care-full when working on this actions</DialogDescription>
          </DialogHeader>

          <DialogBody className='space-y-5'>
            <ul className='list-disc ml-5 mt-2'>
              <li>
                Copy <pre className='inline text-primary'>X</pre> to <pre className='inline text-primary'>Y</pre> will
                copy the whole emission data(GWP, Mobile combustion, scope 2, Stationary combustion ...)
              </li>
              <li>
                Delete <pre className='inline text-primary'>X</pre> year will also delete the the whole data
              </li>
            </ul>
          </DialogBody>

          <DialogFooter>
            {max === min ? null : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='destructive'
                    className='mr-auto'
                    disabled={deleteMutation.isPending}
                    onClick={() => setIsDeleteModal(true)}>
                    <Trash className='size-5 mr-2' />
                    Delete {min}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='top'>Delete this?</TooltipContent>
              </Tooltip>
            )}

            <div className='flex'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    disabled={yearMutation.isPending}
                    className={cn(max !== currentYear ? 'rounded-r-none' : '', 'focus:z-10')}
                    onClick={() => yearMutation.mutate({ from: min, to: min - 1 })}>
                    <Plus className='h-4 w-4 mr-2' />
                    Add {min - 1}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='top'>
                  Clone {min} into {min - 1} year
                </TooltipContent>
              </Tooltip>

              {max < currentYear ?
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      disabled={yearMutation.isPending}
                      className={cn('rounded-l-none', 'focus:z-10')}
                      onClick={() => yearMutation.mutate({ from: max, to: max + 1 })}>
                      <Plus className='h-4 w-4 mr-2' />
                      Add {max + 1}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='top'>
                    Clone {max} into {max + 1} year
                  </TooltipContent>
                </Tooltip>
              : null}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isDeleteModal && (
        <AlertDeleteDialog
          mutation={deleteMutation}
          description='This action will also delete other emission factor data, However, you can always create this year by clonning to other year later'
          onClose={() => setIsDeleteModal(false)}
          handleDelete={() => {
            const id = query.data.find((i) => i.year === min)
            if (!id) throw Error('impossible not found id')
            deleteMutation.mutate(id)
            setIsDeleteModal(false)
          }}
        />
      )}
    </>
  )
}
