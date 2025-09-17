import { ErrorMutation } from '@/components/Errors.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { CommonIcon } from '@/components/common-icon'
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx'
import { toast } from '@/components/ui/use-toast.ts'
import { q$ } from '@/store'
import { actionMappings } from '@/utilities/action-mapping.ts'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { Scope2Api, TScope2 } from './api.ts'
import { useScope2 } from './context.tsx'

const TypeSchema = v.pipe(
  v.object({
    groupById: v.pipe(v.number(), v.minValue(1)),
    category: v.pipe(v.string(), v.nonEmpty('Please enter your "category"')),
    type: v.union([
      v.literal('electric'),
      v.literal('heat'),
      v.literal('steam'),
      v.literal('gas'),
      v.literal('cooling'),
    ]),
    location: v.optional(v.string()),

    // not needed in BE
    createAnother: v.optional(v.boolean(), false),
  }),

  v.transform(({ createAnother, location, ...payload }) => ({
    ...payload,
    ...(payload.type === 'electric' ? { location } : {}),
  })),
)

export type TAddNewTypeSchema = v.InferInput<typeof TypeSchema>

DialogType.displayName = 'Scope2 DialogType'
export function DialogType({
  type,
  data,
  onClose,
}: {
  type: 'create' | 'edit'
  data?: TScope2['main']['base']
  onClose: (b: boolean) => void
}) {
  const { queryKey } = useScope2()
  const action = actionMappings[type]

  const form = useForm<TAddNewTypeSchema>({
    defaultValues:
      type === 'edit' ?
        {
          groupById: data.groupById,
          category: data.category,
          type: data.type,
          location: data.type === 'electric' ? data.location : undefined,
        }
      : { groupById: undefined, category: '', type: '' as never, location: '' },
    resolver: valibotResolver(TypeSchema),
  })

  const mutation = useMutation(
    Scope2Api.main.mutationOption({
      type,
      onSuccess: () => {
        toast({ description: `Scope2 ${action.past_tense}` })

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
              const result = v.safeParse(TypeSchema, form.getValues())

              if (result.success) {
                const extra = type === 'edit' ? { id: data.id } : { status: 'active' }

                await mutation.mutateAsync({ ...extra, ...result.output })
              }
            })}>
            <DialogHeader>
              <DialogTitle>{type === 'edit' ? 'Edit' : 'Create New'} Type</DialogTitle>
              <DialogDescription>Please key-in group, state and fuel type</DialogDescription>
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
                      <Input placeholder='address or some identifier for this category' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name='type'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='select-type'> What is the Scope type</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        onValueChange={(value) => {
                          field.onChange(value)
                          // form.setValue('location', null)
                        }}
                        value={field.value}
                        variant='outline'
                        type='single'
                        className='flex justify-start'>
                        {['electric', 'steam', 'heat', 'cooling'].map((t, k) => (
                          <ToggleGroupItem
                            key={k}
                            id='select-type'
                            value={t}
                            aria-label={t}
                            className='p-4 flex gap-2 capitalize data-[state=on]:border-primary'>
                            <CommonIcon type={t} className='size-5' />
                            {t}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('type') === 'electric' ?
                <FormField
                  control={form.control}
                  name='location'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor='select-group'>Select Location</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger id='select-group' className='w-full capitalize'>
                            <SelectValue placeholder='Select any location' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {['peninsular', 'sabah', 'sarawak'].map((loc, k) => (
                                <SelectItem className='capitalize' key={k} value={loc}>
                                  {loc}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              : null}
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
