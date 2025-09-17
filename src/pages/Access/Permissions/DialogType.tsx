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
import { Textarea } from '@/components/ui/textarea.tsx'
import { toast } from '@/components/ui/use-toast.ts'
import { q$ } from '@/store'
import { actionMappings } from '@/utilities/action-mapping.ts'
import { PermissionSchema, type TPermissionSchema } from '@/utilities/validation/rbac-schemas.ts'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { PermissionApi, TPermission } from './api.ts'
import { usePermission } from './context.tsx'

const CreatePermissionSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string(),
      v.nonEmpty('Permission name is required'),
      v.maxLength(100, 'Permission name is too long'),
      v.regex(
        /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)*\.(create|update|delete|view)$/,
        'Permission name must follow pattern: module.verb or scope.module.verb (verbs: create, update, delete, view)'
      )
    ),
    description: v.optional(v.pipe(
      v.string(),
      v.maxLength(255, 'Description is too long')
    )),
    createAnother: v.optional(v.boolean(), false),
  }),
  v.transform(({ createAnother, ...payload }) => payload),
)

export type TCreatePermissionSchema = v.InferInput<typeof CreatePermissionSchema>

DialogType.displayName = 'Permission DialogType'
export function DialogType({
  type,
  data,
  onClose,
}: {
  type: 'create' | 'edit'
  data?: TPermission['main']['base']
  onClose: (b: boolean) => void
}) {
  const { queryKey } = usePermission()
  const action = actionMappings[type]

  const form = useForm<TCreatePermissionSchema>({
    defaultValues:
      type === 'edit' ?
        {
          name: data.name,
          description: data.description || '',
        }
      : { name: '', description: '' },
    resolver: valibotResolver(CreatePermissionSchema),
  })

  const mutation = useMutation(
    PermissionApi.main.mutationOption({
      type,
      onSuccess: () => {
        toast({ description: `Permission ${action.past_tense}` })

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
              const result = v.safeParse(CreatePermissionSchema, form.getValues())

              if (result.success) {
                const extra = type === 'edit' ? { id: data.id } : {}
                await mutation.mutateAsync({ ...extra, ...result.output })
              }
            })}>
            <DialogHeader>
              <DialogTitle>{type === 'edit' ? 'Edit' : 'Create New'} Permission</DialogTitle>
              <DialogDescription>
                {type === 'edit' ? 'Update permission details' : 'Create a new permission for the system'}
              </DialogDescription>
            </DialogHeader>

            <ErrorMutation mutation={mutation} className='pb-0!' />

            <DialogBody className='space-y-5'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Name</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., scope1.stationary-combustion.view' {...field} />
                    </FormControl>
                    <FormDescription>
                      Pattern: scope1.module.verb, scope2.scope2.verb, scope3.module.verb, or emission-production.verb (verbs: create, update, delete, view)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Optional description of what this permission allows'
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description to help understand this permission&apos;s purpose.
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
