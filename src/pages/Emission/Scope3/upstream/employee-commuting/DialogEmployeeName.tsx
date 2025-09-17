import { ErrorMutation } from '@/components/Errors.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { FormCheckboxCreateAnother } from '@/components/reusable-forms/FormCheckboxCreateAnother.tsx'
import { FormSelectGroupBy } from '@/components/reusable-forms/FormSelectGroupBy.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { toast } from '@/components/ui/use-toast.ts'
import { q$ } from '@/store'
import { actionMappings } from '@/utilities/action-mapping.ts'
import { cn } from '@/utilities/cn.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { EmployeeCommutingApi, TEmployeeCommuting } from './api.ts'
import { useEmployeeCommuting } from './context.tsx'

const EmployeeRegistrySchema = v.pipe(
  v.object({
    groupById: v.pipe(v.number(), v.minValue(1)),
    employeeRegistryId: v.number(),

    // not needed in BE
    createAnother: v.optional(v.boolean(), false),
  }),

  v.transform(({ createAnother, ...payload }) => payload),
)

export type TAddNewTypeSchema = v.InferInput<typeof EmployeeRegistrySchema>

export function DialogEmployeeName({
  type,
  data,
  onClose,
}: {
  type: 'create' | 'edit'
  data?: TEmployeeCommuting['main']['base']
  onClose: (b: boolean) => void
}) {
  const action = actionMappings[type]
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ open: boolean }>({ open: undefined })

  const { queryKey } = useEmployeeCommuting()

  const form = useForm<TAddNewTypeSchema>({
    defaultValues:
      type === 'edit' ?
        { groupById: data.groupById, employeeRegistryId: data.employeeRegistryId }
      : { groupById: undefined, employeeRegistryId: undefined },
    resolver: valibotResolver(EmployeeRegistrySchema),
  })

  const dropdownEmployeeRegistryQuery = q$.General.EmployeeRegistryQuery.useDropdownQuery()

  const mutation = useMutation(
    EmployeeCommutingApi.main.mutationOption({
      type,
      onSuccess: () => {
        toast({ description: `Employee Commuting ${action.past_tense}` })

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
              const result = v.safeParse(EmployeeRegistrySchema, form.getValues())

              if (result.success) {
                const extra = type === 'edit' ? { id: data.id } : { status: 'active' }
                await mutation.mutateAsync({ ...extra, ...result.output })
              }
            })}>
            <DialogHeader>
              <DialogTitle>{type === 'create' ? 'Add new' : 'Edit'} employee</DialogTitle>
            </DialogHeader>

            <ErrorMutation mutation={mutation} className='pb-0!' />

            <DialogBody className='space-y-5'>
              <FormSelectGroupBy />

              <FormField
                control={form.control}
                name='employeeRegistryId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='select-mobile-vehicle' className='block'>
                      Employee Name
                    </FormLabel>
                    <FormControl>
                      <Popover open={popoverStates.open} onOpenChange={handleOpenChangeWith('open')} modal>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            role='combobox'
                            aria-expanded={popoverStates.open}
                            id='select-mobile-vehicle'
                            className='justify-between w-full'>
                            {field.value ?
                              <span className='capitalize'>
                                {(field.value ?
                                  dropdownEmployeeRegistryQuery.data?.find((i) => i.id === field.value)?.name
                                : '') ?? data.employeeRegistry.name}
                              </span>
                            : <span className='text-gray-500'>select employee name</span>}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='p-0' align='start'>
                          <Command
                            filter={(_, search, kws) =>
                              +!!kws.map((i) => i.toLowerCase()).some((kw) => kw.includes(search.toLowerCase()))
                            }>
                            <CommandInput placeholder={`Search employee's name`} />
                            <CommandList>
                              <CommandEmpty>No vehicle type found.</CommandEmpty>
                              <CommandGroup>
                                {dropdownEmployeeRegistryQuery.data?.map((er) => (
                                  <CommandItem
                                    className='capitalize'
                                    key={er.id}
                                    value={er.id + ''}
                                    keywords={[er.name, er.staffId].filter(Boolean)}
                                    onSelect={(currentValue) => {
                                      field.onChange(+currentValue)
                                      handleOpenChangeWith('open', false)
                                    }}>
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        +field.value === er.id ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                    {er.name} {er.staffId ? '(' + er.staffId + ')' : ''}
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
