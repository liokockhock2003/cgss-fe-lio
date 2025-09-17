import { FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@/components/ui/form.tsx'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { useFormContext } from 'react-hook-form'

type DynamicFormName = 'type' | `${string}.type`

export const FormSelectTypeDistanceOrLitre = () => {
  const form = useFormContext<{ [key in DynamicFormName]: 'distance' | 'litre' | string }>()
  const parentContext = useFormField()

  const name = ((parentContext.name ? `${parentContext.name}.` : '') + 'type') as DynamicFormName

  return (
    <FormField
      name={name}
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor='select-type'>Type</FormLabel>
          <FormControl>
            <Select
              onValueChange={field.onChange}
              onOpenChange={(e) => {
                if (!e) field.onBlur()
              }}
              value={field.value}>
              <SelectTrigger className='w-full'>
                <SelectValue
                  placeholder='Select any'
                  className='flex-1 text-ellipsis whitespace-nowrap overflow-hidden'
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem className='capitalize truncate' value='litre'>
                    Litre (L)
                  </SelectItem>
                  <SelectItem className='capitalize truncate' value='distance'>
                    Distance (km)
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
