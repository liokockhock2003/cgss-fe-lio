import { ErrorMutation } from '@/components/Errors.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { FormCheckboxCreateAnother } from '@/components/reusable-forms/FormCheckboxCreateAnother.tsx'
import { FormSelectGroupBy } from '@/components/reusable-forms/FormSelectGroupBy.tsx'
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { toast } from '@/components/ui/use-toast.ts'
import { q$ } from '@/store'
import { actionMappings } from '@/utilities/action-mapping.ts'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { EmissionProductionApi, type TEmissionProduction } from './api.ts'
import { useEmissionProduction } from './context.tsx'

const CategorySchema = v.pipe(
  v.object({
    groupById: v.pipe(v.number(), v.minValue(1)),
    category: v.pipe(v.string(), v.nonEmpty('Please enter your "category"')),

    // not needed in BE
    createAnother: v.optional(v.boolean(), false),
  }),

  v.transform(({ createAnother, ...payload }) => payload),
)

export type TAddNewTypeSchema = v.InferInput<typeof CategorySchema>

DialogCategory.displayName = 'EmissionProductionDialogCategory'
export function DialogCategory({
  type,
  data,
  onClose,
}: {
  type: 'create' | 'edit'
  data?: TEmissionProduction['main']['base']
  onClose: (b: boolean) => void
}) {
  const { queryKey } = useEmissionProduction()
  const action = actionMappings[type]

  const form = useForm<TAddNewTypeSchema>({
    defaultValues:
      type === 'edit' ? { groupById: data.groupById, category: data.category } : { groupById: undefined, category: '' },
    resolver: valibotResolver(CategorySchema),
  })

  const mutation = useMutation(
    EmissionProductionApi.main.mutationOption({
      type,
      onSuccess: () => {
        toast({ description: `Category ${action.past_tense}` })

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
            onSubmit={form.handleSubmit(() => {
              const result = v.safeParse(CategorySchema, form.getValues())

              if (result.success) {
                const extra = type === 'edit' ? { id: data.id } : { status: 'active' }
                mutation.mutate({ ...result.output, ...extra })
              }
            })}>
            <DialogHeader>
              <DialogTitle>{type === 'create' ? 'Add new' : 'Edit'} category</DialogTitle>
              <DialogDescription>eg: Chemical leakage, etc...</DialogDescription>
            </DialogHeader>

            <ErrorMutation mutation={mutation} className='pb-0!' />

            <DialogBody className='space-y-5'>
              <FormSelectGroupBy />

              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder='any category' {...field} />
                    </FormControl>
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
