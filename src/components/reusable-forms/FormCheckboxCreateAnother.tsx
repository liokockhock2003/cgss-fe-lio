import { Checkbox } from '@/components/ui/checkbox.tsx'
import { useFormContext } from 'react-hook-form'
import { FormField, FormLabel } from '../ui/form.tsx'

export const FormCheckboxCreateAnother = () => {
  const form = useFormContext<{ createAnother: boolean }>()

  return (
    <FormField
      name='createAnother'
      control={form.control}
      render={({ field }) => (
        <div className='flex items-center space-x-2 mr-auto'>
          <Checkbox id='createAnother' checked={field.value} onCheckedChange={(checked) => field.onChange(checked)} />
          <FormLabel
            htmlFor='createAnother'
            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
            Create another
          </FormLabel>
        </div>
      )}
    />
  )
}
