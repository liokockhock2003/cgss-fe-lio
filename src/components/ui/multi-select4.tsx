// https://gist.github.com/tushar-rupani/b59d30d82dfa248814739cb07291f94a
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/utilities/cn.ts'
import { Check, ChevronDown } from 'lucide-react'
import React, { useEffect, useState } from 'react'

export function MultipleSelector4<Opt extends { label: string; value: string }>({
  options,
  onChange,
  values,
  placeholder,
  disabled,
  enableSearch = true,
  CustomLabelTemplate,
  CustomOptionTemplate,
  align = 'end',
}: {
  enableSearch?: boolean
  options: Opt[]
  placeholder?: string
  disabled?: boolean
  onChange: (value: string[]) => void | boolean // if true, will skip setting new value
  values: Array<string>
  CustomLabelTemplate?: ({ value }: { value: string[] }) => React.ReactElement
  CustomOptionTemplate?: ({ option }: { option: Opt }) => React.ReactElement
  align?: 'start' | 'center' | 'end'
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<string[]>([])

  useEffect(() => setValue(values ?? []), [values])

  const handleSetValue = (val: string) => {
    setValue((prevValue) => {
      const newValue = prevValue.includes(val) ? prevValue.filter((item) => item !== val) : [...prevValue, val]
      const shouldSkip = onChange(newValue)
      return shouldSkip ? prevValue : newValue
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          role='combobox'
          aria-expanded={open}
          className='w-full h-10 justify-between'>
          <div className='flex gap-2 justify-start'>
            {CustomLabelTemplate ?
              <CustomLabelTemplate value={value} />
            : value?.length ?
              value.map((val, i) => (
                <div key={i} className='px-2 py-1 rounded-xl border bg-primary text-xs font-medium'>
                  {options?.find((opt) => opt.value === val)?.label}
                </div>
              ))
            : <span className='text-muted-foreground'>{placeholder}</span>}
          </div>
          <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-0' align={align}>
        <Command>
          {enableSearch && <CommandInput placeholder='Search...' />}
          <CommandEmpty>Not found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {options?.map((opt) => (
                <CommandItem key={opt.value} value={opt.value} onSelect={() => handleSetValue(opt.value)}>
                  <Check className={cn('mr-2 h-4 w-4', value.includes(opt.value) ? 'opacity-100' : 'opacity-0')} />
                  {CustomOptionTemplate ?
                    <CustomOptionTemplate option={opt} />
                  : opt.label}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
