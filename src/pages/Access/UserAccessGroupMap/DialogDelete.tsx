import { ErrorMutation } from '@/components/Errors.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { toast } from '@/components/ui/use-toast.ts'
import { q$ } from '@/store'
import { useMutation } from '@tanstack/react-query'
import { UserAccessGroupMapApi, TUserAccessGroupMap } from './api.ts'
import { useUserAccessGroupMap } from './context.tsx'

DialogDelete.displayName = 'UserAccessGroupMap DialogDelete'
export function DialogDelete({
  data,
  onClose,
}: {
  data: TUserAccessGroupMap['main']['base']
  onClose: (b: boolean) => void
}) {
  const { queryKey } = useUserAccessGroupMap()

  const mutation = useMutation(
    UserAccessGroupMapApi.main.mutationOption({
      type: 'delete',
      onSuccess: () => {
        toast({ description: 'User-AccessGroup mapping deleted successfully' })
        closeModal()
      },
    }),
  )

  const closeModal = () => {
    onClose(false)
    q$.invalidateQuery([...queryKey])
  }

  const handleDelete = async () => {
    await mutation.mutateAsync({ id: data.id })
  }

  return (
    <Dialog open onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Mapping</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the mapping between User {data.userId} and Access Group {data.accessGroupId}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <ErrorMutation mutation={mutation} />

        <DialogFooter>
          <Button variant='outline' onClick={closeModal} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={mutation.isPending}
            className='flex gap-x-2'
          >
            {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
            Delete Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
