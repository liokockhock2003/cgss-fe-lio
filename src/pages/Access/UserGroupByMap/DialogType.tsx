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
import { UserGroupByMapSchema, type TUserGroupByMapSchema } from '@/utilities/validation/rbac-schemas.ts'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { UserGroupByMapApi, TUserGroupByMap } from './api.ts'
import { useUserGroupByMap } from './context.tsx'

const CreateUserGroupByMapSchema = v.pipe(
  v.object({
    userId: v.pipe(v.number(), v.integer('User ID must be an integer')),
    groupById: v.pipe(v.number(), v.integer('GroupBy ID must be an integer')),
    createAnother: v.optional(v.boolean(), false),
  }),
  v.transform(({ createAnother, ...payload }) => payload),
)

export type TCreateUserGroupByMapSchema = v.InferInput<typeof CreateUserGroupByMapSchema>

DialogType.displayName = 'UserGroupByMap DialogType'
export function DialogType({
  type,
  data,
  onClose,
}: {
  type: 'create' | 'edit'
  data?: TUserGroupByMap['main']['base']
  onClose: (b: boolean) => void
}) {
  const { queryKey } = useUserGroupByMap()
  const action = actionMappings[type]

  const form = useForm<TCreateUserGroupByMapSchema>({
    defaultValues:
      type === 'edit' ?
        {
          userId: data.userId,
          groupById: data.groupById,
        }
      : { userId: 0, groupById: 0 },
    resolver: valibotResolver(CreateUserGroupByMapSchema),
  })

  const mutation = useMutation(
    UserGroupByMapApi.main.mutationOption({
      type,
      onSuccess: () => {
        toast({ description: `User-GroupBy mapping ${action.past_tense}` })

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
              const result = v.safeParse(CreateUserGroupByMapSchema, form.getValues())

              if (result.success) {
                const extra = type === 'edit' ? { id: data.id } : {}
                await mutation.mutateAsync({ ...extra, ...result.output })
              }
            })}>
            <DialogHeader>
              <DialogTitle>{type === 'edit' ? 'Edit' : 'Create New'} User-GroupBy Mapping</DialogTitle>
              <DialogDescription>
                {type === 'edit' ? 'Update the mapping relationship' : 'Create a new relationship between a user and a GroupBy entity'}
              </DialogDescription>
            </DialogHeader>

            <ErrorMutation mutation={mutation} className='pb-0!' />

            <DialogBody className='space-y-5'>
              <FormField
                control={form.control}
                name='userId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder='Enter User ID'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      The ID of the user to link to a GroupBy entity.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='groupById'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GroupBy ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder='Enter GroupBy ID'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      The ID of the GroupBy entity to link to the user.
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
