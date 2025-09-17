import { ErrorMutation } from '@/components/Errors'
import { Loading2 } from '@/components/Loading'
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
import { MobileCombustionApi, type TMobileCombustion } from './api.ts'
import { useMobileCombustion } from './context.tsx'

const IdentityNoSchema = v.pipe(
  v.object({
    groupById: v.pipe(v.number(), v.minValue(1)),
    mobileRegistryId: v.pipe(v.string(), v.nonEmpty('Please enter your "Group Scope By"')),

    // not needed in BE
    createAnother: v.optional(v.boolean(), false),
  }),

  v.transform(({ createAnother, mobileRegistryId, ...payload }) => ({
    ...payload,
    mobileRegistryId: +mobileRegistryId,
  })),
)

export type TAddNewTypeSchema = v.InferInput<typeof IdentityNoSchema>

export function DialogIdentityNo({
  type,
  data,
  onClose,
}: {
  type: 'create' | 'edit'
  data?: TMobileCombustion['main']['base']
  onClose: (b: boolean) => void
}) {
  const { queryKey } = useMobileCombustion()
  const action = actionMappings[type]
  const dropdownMobileRegistryQuery = q$.General.MobileRegistryQuery.useDropdownQuery()
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ open: boolean }>({ open: undefined })

  const form = useForm<TAddNewTypeSchema>({
    defaultValues:
      type === 'edit' ?
        { groupById: data.groupById, mobileRegistryId: data.mobileRegistryId + '' }
      : { groupById: undefined, mobileRegistryId: undefined },
    resolver: valibotResolver(IdentityNoSchema),
  })

  const mutation = useMutation(
    MobileCombustionApi.main.mutationOption({
      type,
      onSuccess: () => {
        toast({ description: `Mobile Combustion ${action.past_tense}` })

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
              const result = v.safeParse(IdentityNoSchema, form.getValues())

              if (result.success) {
                const extra = type === 'edit' ? { id: data.id } : { status: 'active' }
                await mutation.mutateAsync({ ...extra, ...result.output })
              }
            })}>
            <DialogHeader>
              <DialogTitle>{type === 'create' ? 'Assign New' : 'Update'} Mobile Grouping</DialogTitle>
              <DialogDescription>Assign mobile to any group</DialogDescription>
            </DialogHeader>

            <ErrorMutation mutation={mutation} className='pb-0!' />

            <DialogBody className='space-y-5'>
              <FormSelectGroupBy />

              <FormField
                control={form.control}
                name='mobileRegistryId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='select-mobile-vehicle' className='block'>
                      Mobile Vehicle
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
                                  dropdownMobileRegistryQuery.data?.find((i) => i.id + '' === field.value)?.identity_no
                                : '') ?? data.mobileRegistry.identity_no}
                              </span>
                            : <span className='text-gray-500'>select fuel type</span>}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='p-0' align='start'>
                          <Command
                            filter={(_, search, keywords) => {
                              return +!!keywords
                                .map((i) => i.toLowerCase())
                                .some((kw) => kw.includes(search.toLowerCase()))
                            }}>
                            <CommandInput placeholder='Search fuels' />
                            <CommandList>
                              <CommandEmpty>No vehicle type found.</CommandEmpty>
                              <CommandGroup>
                                {dropdownMobileRegistryQuery.data?.map((mr) => (
                                  <CommandItem
                                    className='capitalize'
                                    key={mr.id}
                                    value={mr.id + ''}
                                    keywords={[mr.identity_no, mr.model]}
                                    onSelect={(currentValue) => {
                                      field.onChange(currentValue)
                                      handleOpenChangeWith('open', false)
                                    }}>
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        +field.value === mr.id ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                    {mr.identity_no} ({mr.model})
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
                  {type === 'create' ? 'Assign' : 'Save changes'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  )
}
