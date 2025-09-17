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
import { UserGroupByMapApi, TUserGroupByMap } from './api.ts'
import { useUserGroupByMap } from './context.tsx'

DialogDelete.displayName = 'UserGroupByMap DialogDelete'
export function DialogDelete({
  data,
  onClose,
}: {
  data: TUserGroupByMap['main']['base']
  onClose: (b: boolean) => void
}) {
  const { queryKey } = useUserGroupByMap()

  const mutation = useMutation(
    UserGroupByMapApi.main.mutationOption({
      type: 'delete',
      onSuccess: () => {
        toast({ description: 'User-GroupBy mapping deleted successfully' })
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
            Are you sure you want to delete the mapping between User {data.userId} and GroupBy {data.groupById}?
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
