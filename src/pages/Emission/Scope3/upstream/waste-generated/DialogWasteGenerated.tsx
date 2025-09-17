import { ErrorMutation } from '@/components/Errors.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { FormCheckboxCreateAnother } from '@/components/reusable-forms/FormCheckboxCreateAnother.tsx'
import { FormSelectGroupBy } from '@/components/reusable-forms/FormSelectGroupBy.tsx'
import { FormWasteGenerateSupplierSpecific } from '@/components/reusable-forms/waste-generated/FormSupplierSpecific.tsx'
import {
  FormWasteTypeSpecific,
  FormWasteGeneratedSuspended,
} from '@/components/reusable-forms/waste-generated/FormWasteTypeSpecific.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx'
import { toast } from '@/components/ui/use-toast.ts'
import { q$ } from '@/store'
import { actionMappings } from '@/utilities/action-mapping.ts'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { WasteGeneratedApi, TWasteGenerated } from './api.ts'
import { useWasteGenerated } from './context.tsx'

const WasteGeneratedSchema = v.pipe(
  v.object({
    groupById: v.pipe(v.number('please select group'), v.minValue(1)),
    category: v.pipe(v.string('please enter your "category"'), v.nonEmpty('please enter your "category"')),
    type: v.pipe(
      v.union(
        [v.literal('waste_type_specific_method'), v.literal('supplier_specific_method')],
        'please enter your "type"',
      ),
      v.nonEmpty('please enter your "type"'),
    ),

    materialId: v.pipe(v.string(), v.nonEmpty('please enter your "material"')),
    method: v.optional(
      v.union(
        [
          v.literal(''),
          v.literal('recycled'),
          v.literal('landfilled'),
          v.literal('combusted'),
          v.literal('composted'),
          v.literal('anaerobically_digested_dry'),
          v.literal('anaerobically_digested_wet'),
        ],
        'please enter your "material" and "method"',
      ),
    ),

    // not needed in BE
    createAnother: v.optional(v.boolean(), false),
  }),

  v.forward(
    v.check((input) => {
      if (input.type === 'waste_type_specific_method') return (input?.method ?? '') !== ''
      return true
    }, 'Method is required'),
    ['method'],
  ),

  v.transform(({ createAnother, ...payload }) => payload),
)

export type TAddNewTypeSchema = v.InferInput<typeof WasteGeneratedSchema>

export function DialogWasteGenerated({
  type,
  data,
  onClose,
}: {
  type: 'create' | 'edit'
  data?: TWasteGenerated['main']['base']
  onClose: (b: boolean) => void
}) {
  const action = actionMappings[type]
  const { queryKey } = useWasteGenerated()

  const form = useForm<TAddNewTypeSchema>({
    defaultValues:
      type === 'edit' ?
        {
          groupById: data.groupById,
          type: data.type,
          materialId: data.materialId,
          method: data?.method ?? undefined,
          category: data.category,
        }
        : { groupById: undefined, type: undefined, materialId: undefined, method: undefined, category: '' },
    resolver: valibotResolver(WasteGeneratedSchema),
  })

  const mutation = useMutation(
    WasteGeneratedApi.main.mutationOption({
      type,
      onSuccess: () => {
        toast({ description: `Waste ${action.past_tense}` })

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
        <DialogContent aria-describedby={undefined}>
          <form
            className='overflow-hidden flex flex-col'
            onSubmit={form.handleSubmit(async () => {
              const result = v.safeParse(WasteGeneratedSchema, form.getValues())

              if (result.success) {
                const extra = type === 'edit' ? { id: data.id } : { status: 'active' }
                await mutation.mutateAsync({ ...extra, ...result.output })
              }
            })}>
            <DialogHeader>
              <DialogTitle>{type === 'create' ? 'Add new' : 'Edit'} waste</DialogTitle>
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

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem className='gap-2'>
                    <FormLabel>Method Type:</FormLabel>

                    <RadioGroup
                      value={field.value}
                      className='flex gap-x-2'
                      onValueChange={(e: 'supplier_specific_method' | 'waste_type_specific_method') => {
                        form.setValue('type', e)
                        form.setValue('method', undefined)
                        form.setValue('materialId', undefined)
                      }}>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='supplier_specific_method' id='input-supplier-specific' />
                        <Label className='w-full cursor-pointer' htmlFor='input-supplier-specific'>
                          Supplier specific
                        </Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='waste_type_specific_method' id='input-waste-type-specific' />
                        <Label className='w-full cursor-pointer' htmlFor='input-waste-type-specific'>
                          Waste type specific
                        </Label>
                      </div>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Suspense
                fallback={<FormWasteGeneratedSuspended label='Material and Method' placeholder='Loading materials' />}>
                {form.watch('type') === 'waste_type_specific_method' ?
                  <FormWasteTypeSpecific />
                  : <FormWasteGenerateSupplierSpecific />}
              </Suspense>
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
