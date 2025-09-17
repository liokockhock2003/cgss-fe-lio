import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { q$ } from '@/store'
import { cn } from '@/utilities/cn.ts'
import { Check } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

export const FormSelectCompanyAddresses = ({ k, form }: { k: string; form: UseFormReturn<any, any, any> }) => {
  const companyInfo = q$.General.CompanyInfoQuery.getData()
  const [open, setOpen] = useState(false)

  return (
    <FormField
      control={form.control}
      name={k}
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor='select-company-address'>Working Address</FormLabel>
          <FormControl>
            <Popover open={open} onOpenChange={setOpen} modal>
              <PopoverTrigger asChild>
                <Textarea
                  readOnly
                  placeholder={`please select company's address`}
                  className='resize-none cursor-pointer'
                  value={field.value}
                />
              </PopoverTrigger>
              <PopoverContent className='p-0' align='start'>
                <Command>
                  <CommandInput placeholder='Search address' />
                  <CommandList>
                    <CommandEmpty>No address found.</CommandEmpty>
                    <CommandGroup>
                      {companyInfo.addresses.map((addr, id) => (
                        <CommandItem
                          className='capitalize'
                          key={id}
                          value={addr}
                          keywords={[addr]}
                          onSelect={(currentValue) => {
                            field.onChange(currentValue)
                            setOpen(false)
                          }}>
                          <Check className={cn('mr-4 h-5 w-5', field.value === addr ? 'opacity-100' : 'opacity-0')} />
                          {addr}
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
