import { Button } from '@/components/ui/button.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx'
import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@/components/ui/form.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { q$ } from '@/store'
import { cn } from '@/utilities/cn.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

type DynamicFormName = 'employeeRegistryId' | `${string}.employeeRegistryId`

export const FormSelectEmployeeRegistry = () => {
  const form = useFormContext<{ [key in DynamicFormName]: string }>()
  const { popoverStates, handleOpenChangeWith } = usePopoverStates({ open: false })
  const parentContext = useFormField()
  const name = ((parentContext.name ? `${parentContext.name}.` : '') + 'employeeRegistryId') as DynamicFormName

  const dropdownEmployeeRegistryQuery = useQuery(
    q$.General.EmployeeRegistryQuery.list()({ params: { filter: { fields: ['id', 'name'] } } }),
  )

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className='block'>Employee {field.value}</FormLabel>
          <FormControl>
            <Popover open={popoverStates.open} onOpenChange={handleOpenChangeWith('open')} modal>
              <PopoverTrigger asChild>
                <Button
                  disabled={dropdownEmployeeRegistryQuery.isLoading}
                  variant='outline'
                  role='combobox'
                  aria-expanded={popoverStates.open}
                  className='justify-between w-full'>
                  {field.value ?
                    <span className='capitalize'>
                      {dropdownEmployeeRegistryQuery.data?.find(
                        (employee) => employee.id === (field.value as unknown as number),
                      )?.name ?? 'something when wrong'}
                    </span>
                  : 'Please select employee'}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='p-0' align='start'>
                <Command
                  filter={(_, search, keywords) => {
                    return +!!keywords.map((i) => i.toLowerCase()).some((kw) => kw.includes(search.toLowerCase()))
                  }}>
                  <CommandInput placeholder='Search vechicles' />
                  <CommandList>
                    <CommandEmpty>Employee not found.</CommandEmpty>
                    <CommandGroup>
                      {dropdownEmployeeRegistryQuery.data?.map((employee) => (
                        <CommandItem
                          className='capitalize'
                          key={employee.id}
                          keywords={[employee.name]}
                          value={employee.id + ''}
                          onSelect={(currentValue) => {
                            field.onChange(+currentValue)
                            handleOpenChangeWith('open', false)
                          }}>
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              (field.value as unknown as number) === employee.id ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {employee.name}
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
  )
}
