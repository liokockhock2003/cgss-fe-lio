import { FormSelectGroupBy } from '@/components/reusable-forms/FormSelectGroupBy.tsx'
import { DateTimeInput } from '@/components/ui/datetime-input.tsx'
import { DateTimePicker } from '@/components/ui/datetime-picker.tsx'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { useFormContext } from 'react-hook-form'
import { useBusinessTravel } from '../context.tsx'
import { TBusinessTravelSchema } from './common.tsx'

export function _1StepGeneralTravelInfo() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { queryKey } = useBusinessTravel()
  const { from, to } = queryKey[2]

  const form = useFormContext<TBusinessTravelSchema>() // eslint-disable-line react-hooks/rules-of-hooks

  return (
    <div className='space-y-4'>
      <FormSelectGroupBy />

      <FormField
        control={form.control}
        name='date'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <DateTimePicker
                {...field}
                hideTime
                timezone='UTC'
                min={from}
                max={to}
                renderTrigger={({ open, value, setOpen }) => (
                  <DateTimeInput
                    value={value}
                    timezone='UTC'
                    onChange={(x) => !open && field.onChange(x)}
                    format='dd/MM/yyyy'
                    disabled={open}
                    onCalendarClick={() => setOpen(!open)}
                  />
                )}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='purpose'
        render={({ field }) => (
          <FormItem className='grid w-full gap-1.5 mt-4'>
            <FormLabel>Business Purpose:</FormLabel>
            <FormControl>
              <Input placeholder='business purpose' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name='desc'
        render={({ field }) => (
          <FormItem className='grid w-full gap-1.5 mt-4'>
            <FormLabel>Description:</FormLabel>
            <FormControl>
              <Textarea placeholder='Tell us a bit about the activity' className='resize-none' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
