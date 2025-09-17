import { Button } from '@/components/ui/button.tsx'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command.tsx'
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { q$ } from '@/store'
import { cn } from '@/utilities/cn.ts'
import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

export function FormWasteGenerateSupplierSpecific({
  placeholder = 'Select waste material',
  disabled,
  align = 'start',
}: {
  placeholder?: string
  disabled?: boolean
  align?: 'start' | 'center' | 'end'
}) {
  const query = q$.General.EmissionFactoryQuery.useSuspenseDropdown('waste_generated_supplier_specific_method')
  const form = useFormContext<{ materialId: string }>()
  const [open, setOpen] = useState(false)

  const currentPlaceholder = useMemo(() => {
    const { materialId } = form.getValues()
    if (!materialId) return placeholder

    const found = query.data.find((waste) => waste.id === materialId)
    return found ? found.name : placeholder
  }, [form.watch('materialId'), placeholder, query.data])

  return (
    <>
      <FormField
        control={form.control}
        name='materialId'
        render={({ field }) => (
          <FormItem>
            <FormLabel className='block'>Material</FormLabel>
            <FormControl>
              <Popover modal={true} open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    disabled={disabled}
                    role='combobox'
                    aria-expanded={open}
                    className='w-full justify-between dark:bg-background '>
                    <div className={cn('flex gap-2 justify-start', !field.value ? 'text-muted-foreground' : '')}>
                      {currentPlaceholder}
                    </div>
                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='p-0' align={align}>
                  <Command shouldFilter={!field.value}>
                    <CommandEmpty>Not found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {query.data.map((waste) => (
                          <CommandItem key={waste.id} value={waste.id} onSelect={() => field.onChange(waste.id)}>
                            <Check className={cn('size-5', waste.id === field.value ? 'opacity-100' : 'opacity-0')} />
                            <span className='ml-1'>{waste.name}</span>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </FormControl>
          </FormItem>
        )}
      />
    </>
  )
}
