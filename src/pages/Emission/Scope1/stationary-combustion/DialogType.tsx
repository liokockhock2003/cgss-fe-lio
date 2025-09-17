import { ErrorMutation } from '@/components/Errors.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { CommonIcon } from '@/components/common-icon.tsx'
import { FormCheckboxCreateAnother } from '@/components/reusable-forms/FormCheckboxCreateAnother.tsx'
import { FormSelectGroupBy } from '@/components/reusable-forms/FormSelectGroupBy.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group.tsx'
import { toast } from '@/components/ui/use-toast.ts'
import { q$ } from '@/store'
import { actionMappings } from '@/utilities/action-mapping.ts'
import { cn } from '@/utilities/cn.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { kebabCase } from 'lodash-es'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { StationaryCombustionApi, type TStationaryCombustion } from './api.ts'
import { useStationaryCombustion } from './context.tsx'

const TypeSchema = v.pipe(
  v.object({
    groupById: v.pipe(v.number(), v.minValue(1)),
    typeId: v.pipe(v.string(), v.nonEmpty('Please enter your "type"')),
    state: v.union([v.literal('solid'), v.literal('gas'), v.literal('liquid')]),

    // not needed in BE
    createAnother: v.optional(v.boolean(), false),
  }),
  v.transform(({ createAnother, state, ...payload }) => payload),
)

export type TAddNewTypeSchema = v.InferInput<typeof TypeSchema>

DialogType.displayName = 'StationaryCombustion DialogType'
export function DialogType({
  type,
  data,
  onClose,
}: {
  type: 'create' | 'edit'
  data?: TStationaryCombustion['main']['base']
  onClose: (b: boolean) => void
}) {
  const { queryKey } = useStationaryCombustion()
  const action = actionMappings[type]
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ open: boolean }>({ open: undefined })

  const dropdownStationaryCombustionQuery = q$.General.EmissionFactoryQuery.useDropdown('stationary_combustion')

  const form = useForm<TAddNewTypeSchema>({
    defaultValues:
      type === 'edit' ?
        { groupById: data.groupById, state: data.type.state, typeId: data.typeId }
      : { groupById: undefined, state: '' as never, typeId: '' },
    // values: { groupById: '2', state: 'solid', typeId: 'solid-wood-and-wood-residuals' },
    resolver: valibotResolver(TypeSchema),
  })

  const mutation = useMutation(
    StationaryCombustionApi.main.mutationOption({
      type,
      onSuccess: () => {
        toast({ description: `Stationary Combustion ${action.past_tense}` })

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

  const fuelTypes = useMemo(() => {
    return dropdownStationaryCombustionQuery.data?.filter((d) => d.state === form.getValues().state)
  }, [dropdownStationaryCombustionQuery.data, form.getValues('state')])

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
                name='state'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='select-state'> What is the states</FormLabel>
                    <FormControl>
                      <ToggleGroup
                        onValueChange={(value) => {
                          field.onChange(value)
                          form.setValue('typeId', null)
                        }}
                        value={field.value}
                        variant='outline'
                        type='single'
                        className='flex justify-start'>
                        <ToggleGroupItem
                          id='select-state'
                          value='solid'
                          aria-label='Solid'
                          className='p-4 flex gap-2 data-[state=on]:border-primary'>
                          <CommonIcon type='solid' className='size-5' />
                          Solid
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value='liquid'
                          aria-label='Liquid'
                          className='p-4 flex gap-2 data-[state=on]:border-primary'>
                          <CommonIcon type='liquid' className='size-5' />
                          Liquid
                        </ToggleGroupItem>
                        <ToggleGroupItem
                          value='gas'
                          aria-label='Gas'
                          className='p-4 flex gap-2 data-[state=on]:border-primary'>
                          <CommonIcon type='gas' className='size-5' />
                          Gas
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='typeId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='select-typeId' className='block'>
                      Fuel Type
                    </FormLabel>
                    <FormControl>
                      <Popover open={popoverStates.open} onOpenChange={handleOpenChangeWith('open')} modal>
                        <PopoverTrigger asChild>
                          <Button
                            id='select-typeId'
                            variant='outline'
                            role='combobox'
                            disabled={!form.watch('state') || dropdownStationaryCombustionQuery.isLoading}
                            aria-expanded={popoverStates.open}
                            className='justify-between w-full'>
                            {
                              // prettier-ignore
                              dropdownStationaryCombustionQuery.isLoading
                                ? 'Loading ...'
                                : field.value
                                  ? <span className='capitalize'>{fuelTypes?.find((fuel_type) => fuel_type.id === field.value)?.name}</span>
                                  : form.watch('state')
                                    ? `Search ${form.watch('state')} fuel type...`
                                    : 'Please select state first'
                            }
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='p-0' align='start'>
                          <Command>
                            <CommandInput placeholder={`Search ${form.watch('state')} fuel type...`} />
                            <CommandList>
                              <CommandEmpty>No fuel type found.</CommandEmpty>
                              <CommandGroup>
                                {fuelTypes?.map((fuel_type) => (
                                  <CommandItem
                                    className='capitalize'
                                    key={fuel_type.name + fuel_type.state}
                                    value={fuel_type.state + '-' + kebabCase(fuel_type.name)}
                                    onSelect={(currentValue) => {
                                      field.onChange(currentValue === field.value ? '' : currentValue)
                                      handleOpenChangeWith('open', false)
                                    }}>
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === fuel_type.id ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                    {fuel_type.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
