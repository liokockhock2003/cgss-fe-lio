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
import { PermissionApi, TPermission } from './api.ts'
import { usePermission } from './context.tsx'

DialogDelete.displayName = 'Permission DialogDelete'
export function DialogDelete({
  data,
  onClose,
}: {
  data: TPermission['main']['base']
  onClose: (b: boolean) => void
}) {
  const { queryKey } = usePermission()

  const mutation = useMutation(
    PermissionApi.main.mutationOption({
      type: 'delete',
      onSuccess: () => {
        toast({ description: 'Permission deleted successfully' })
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
          <DialogTitle>Delete Permission</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the permission &quot;{data.name}&quot;?
            This action cannot be undone and will remove this permission from all roles.
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
            Delete Permission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
