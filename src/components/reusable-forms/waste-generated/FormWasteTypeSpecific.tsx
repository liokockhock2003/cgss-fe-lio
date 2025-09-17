import { Loading2 } from '@/components/Loading.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command.tsx'
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { q$ } from '@/store'
import { EmissionFactorDropdown } from '@/store/query/emission-factor.ts'
import { cn } from '@/utilities/cn.ts'
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

export function FormWasteTypeSpecific({
  placeholder = 'Select waste material and method',
  disabled,
  enableSearch = true,
  align = 'start',
}: {
  enableSearch?: boolean
  placeholder?: string
  disabled?: boolean
  align?: 'start' | 'center' | 'end'
}) {
  const query = q$.General.EmissionFactoryQuery.useSuspenseDropdown('waste_generated')
  const form = useFormContext<{
    materialId: string
    method: EmissionFactorDropdown['waste_generated'][number]['methods'][number]['id']
  }>()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState<EmissionFactorDropdown['waste_generated'][number]>(undefined)

  const goBack = () => setPage(undefined)
  const onOpenChange = (e) => {
    setOpen(e)
    if (!e) {
      setTimeout(() => {
        goBack()
        setSearch('')
      }, 300)
    }
  }

  const isPlaceholder = useMemo(() => {
    const { materialId, method } = form.getValues()
    return !(materialId && method)
  }, [form])

  const currentPlaceholder = useMemo(() => {
    const { materialId, method } = form.getValues()

    if (!materialId && !method) return placeholder
    if (materialId && !method) return 'select method'

    const found = query.data.find((waste) => waste.id === materialId)
    return `${found.material} with ${found.methods.find((m) => m.id === method)?.name}`
  }, [form.watch('materialId'), form.watch('method'), placeholder, query.data])

  return (
    <>
      <FormField
        control={form.control}
        name='materialId'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='block'>Material and Method</FormLabel>
            <FormControl>
              <Popover modal={true} open={open} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    disabled={disabled}
                    role='combobox'
                    aria-expanded={open}
                    className='w-full justify-between dark:bg-background '>
                    <div className={cn('flex gap-2 justify-start', isPlaceholder ? 'text-muted-foreground' : '')}>
                      {currentPlaceholder}
                    </div>
                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='p-0' align={align}>
                  <Command shouldFilter={!field.value}>
                    {enableSearch && !field.value && (
                      <CommandInput value={search} onValueChange={setSearch} placeholder='Search...' />
                    )}
                    <CommandEmpty>Not found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {
                          //  parent page
                          !page ?
                            query.data.map((waste) => (
                              <CommandItem
                                key={waste.id}
                                value={waste.id}
                                onSelect={() => {
                                  field.onChange(waste.id)
                                  setPage(waste)
                                }}>
                                <Check
                                  className={cn('size-5', waste.id === field.value ? 'opacity-100' : 'opacity-0')}
                                />
                                <span className='ml-1'>{waste.material}</span>

                                <ChevronRight className='ml-auto size-5' />
                              </CommandItem>
                            ))
                          : <>
                              {/* sub page */}

                              <FormField
                                control={form.control}
                                name='method'
                                render={({ field: methodField }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div>
                                        <CommandItem
                                          className='gap-x-1'
                                          onSelect={() => {
                                            goBack()
                                            methodField.onChange('')
                                          }}>
                                          <ChevronLeft className='size-5' />
                                          Back
                                        </CommandItem>
                                        <CommandSeparator />
                                        {query.data
                                          .find((_) => _.id === field.value)
                                          .methods.map(
                                            (
                                              method: EmissionFactorDropdown['waste_generated'][number]['methods'][number],
                                            ) => (
                                              <CommandItem
                                                className='gap-x-1'
                                                key={method.id}
                                                value={method.id}
                                                onSelect={() => methodField.onChange(method.id)}>
                                                <Check
                                                  className={cn(
                                                    'size-5',
                                                    methodField.value === method.id ? 'opacity-100' : 'opacity-0',
                                                  )}
                                                />

                                                {method.name}
                                              </CommandItem>
                                            ),
                                          )}
                                      </div>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </>

                        }
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
            {form.getFieldState('method').error?.message ?
              <p data-slot='form-message' className='text-sm font-medium text-destructive dark:text-red-500'>
                {form.getFieldState('method').error?.message}
              </p>
            : null}
          </FormItem>
        )}
      />
    </>
  )
}

export const FormWasteGeneratedSuspended = memo(({ label, placeholder }: { label: string; placeholder: string }) => {
  return (
    <FormItem>
      <FormLabel className='block'>{label}</FormLabel>
      <Button variant='outline' disabled role='combobox' className='w-full justify-between'>
        <div className='flex gap-x-2 items-center'>
          {placeholder}
          <Loading2 className='h-4 w-4 opacity-50' />
        </div>
        <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
      </Button>
    </FormItem>
  )
})
