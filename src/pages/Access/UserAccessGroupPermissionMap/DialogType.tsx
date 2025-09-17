import { ErrorMutation } from '@/components/Errors.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { FormCheckboxCreateAnother } from '@/components/reusable-forms/FormCheckboxCreateAnother.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { toast } from '@/components/ui/use-toast.ts'
import { q$ } from '@/store'
import { actionMappings } from '@/utilities/action-mapping.ts'
import { UserAccessGroupPermissionMapSchema, type TUserAccessGroupPermissionMapSchema } from '@/utilities/validation/rbac-schemas.ts'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { UserAccessGroupPermissionMapApi, TUserAccessGroupPermissionMap } from './api.ts'
import { useUserAccessGroupPermissionMap } from './context.tsx'

const CreateUserAccessGroupPermissionMapSchema = v.pipe(
  v.object({
    accessGroupId: v.pipe(v.number(), v.integer('Access Group ID must be an integer')),
    permissionId: v.pipe(v.number(), v.integer('Permission ID must be an integer')),
    createAnother: v.optional(v.boolean(), false),
  }),
  v.transform(({ createAnother, ...payload }) => payload),
)

export type TCreateUserAccessGroupPermissionMapSchema = v.InferInput<typeof CreateUserAccessGroupPermissionMapSchema>

DialogType.displayName = 'UserAccessGroupPermissionMap DialogType'
export function DialogType({
  type,
  data,
  onClose,
}: {
  type: 'create' | 'edit'
  data?: TUserAccessGroupPermissionMap['main']['base']
  onClose: (b: boolean) => void
}) {
  const { queryKey } = useUserAccessGroupPermissionMap()
  const action = actionMappings[type]

  const form = useForm<TCreateUserAccessGroupPermissionMapSchema>({
    defaultValues:
      type === 'edit' ?
        {
          accessGroupId: data.accessGroupId,
          permissionId: data.permissionId,
        }
      : { accessGroupId: 0, permissionId: 0 },
    resolver: valibotResolver(CreateUserAccessGroupPermissionMapSchema),
  })

  const mutation = useMutation(
    UserAccessGroupPermissionMapApi.main.mutationOption({
      type,
      onSuccess: () => {
        toast({ description: `AccessGroup-Permission mapping ${action.past_tense}` })

        if (form.getValues().createAnother) {
          form.reset({ createAnother: true })
        } else {
          closeModal()
        }
      },
    }),
  )

  const closeModal = () => {
    onClose(false)
    q$.invalidateQuery([...queryKey])
  }

  return (
    <Form {...form}>
      <Dialog open onOpenChange={closeModal}>
        <DialogContent>
          <form
            className='overflow-hidden flex flex-col'
            onSubmit={form.handleSubmit(async () => {
              const result = v.safeParse(CreateUserAccessGroupPermissionMapSchema, form.getValues())

              if (result.success) {
                const extra = type === 'edit' ? { id: data.id } : {}
                await mutation.mutateAsync({ ...extra, ...result.output })
              }
            })}>
            <DialogHeader>
              <DialogTitle>{type === 'edit' ? 'Edit' : 'Create New'} AccessGroup-Permission Mapping</DialogTitle>
              <DialogDescription>
                {type === 'edit' ? 'Update the mapping relationship' : 'Create a new relationship between an access group (role) and a permission'}
              </DialogDescription>
            </DialogHeader>

            <ErrorMutation mutation={mutation} className='pb-0!' />

            <DialogBody className='space-y-5'>
              <FormField
                control={form.control}
                name='accessGroupId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Group ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder='Enter Access Group ID'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      The ID of the access group (role) to assign permissions to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='permissionId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder='Enter Permission ID'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      The ID of the permission to assign to the access group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogBody>

            <DialogFooter>
              {action.base === 'create' && <FormCheckboxCreateAnother />}

              <div className='flex justify-end gap-4'>
                <Button variant='secondary' type='button' onClick={closeModal}>
                  Cancel
                </Button>

                <Button disabled={mutation.isPending} type='submit' className='flex gap-x-2'>
                  {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
                  {type === 'create' ? 'Create' : 'Save changes'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  )
}
