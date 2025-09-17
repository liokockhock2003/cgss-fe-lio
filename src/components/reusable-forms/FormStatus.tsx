import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { useFormContext } from 'react-hook-form'

export const FormStatus = () => {
  // we need to change this, later mapping active | inactive should be done here
  const form = useFormContext<{ status: 'on' | 'off' }>()

  return (
    <FormField
      control={form.control}
      name='status'
      render={({ field }) => (
        <FormItem className='flex items-center gap-x-1'>
          <FormLabel>Status:</FormLabel>
          <FormControl>
            <Switch
              className='mt-0!'
              checked={field.value === 'on'}
              value={field.value ? 'on' : 'off'}
              onCheckedChange={(e) => field.onChange(e ? 'on' : 'off')}
            />
          </FormControl>
          <FormDescription className='capitalize mt-0!'>{field.value === 'on' ? 'active' : 'inactive'}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
