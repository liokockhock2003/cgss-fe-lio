import { ErrorMutation } from '@/components/Errors.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { Button } from '@/components/ui/button.tsx'
import { DateTimeInput } from '@/components/ui/datetime-input.tsx'
import { DateTimePicker } from '@/components/ui/datetime-picker.tsx'
import { DialogFooter } from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { InputNumber } from '@/components/ui/input-number.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { q$ } from '@/store'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { WasteGeneratedApi, TWasteGenerated } from '../api.ts'
import type { DialogActivityPayload } from './Dialog.tsx'

ActivityForm.displayName = 'EmployeeCommuting ActivityForm'

export function ActivityForm({
  data,
  type,
  secondaryAction,
  rowColumnInfo,
}: {
  type: 'edit' | 'create'
  secondaryAction?: () => void
  data?: TWasteGenerated['activities']
  rowColumnInfo: DialogActivityPayload
}) {
  const { row, columnDef } = rowColumnInfo
  const { year, month } = columnDef.meta?.columnInfo ?? { year: 0, month: 0 }
  const [minDate, maxDate] = [startOfMonth(new Date(year, month - 1)), endOfMonth(new Date(year, month - 1))]

  const ActivitySchema = useMemo(() => {
    return v.object({
      date: v.pipe(v.date(), v.minValue(minDate), v.maxValue(maxDate)),
      input: v.pipe(v.number(), v.minValue(0)),
      desc: v.pipe(
        v.string(),
        v.nonEmpty('Please enter your "description"'),
        v.maxLength(300, 'Your "description" is too long.'),
      ),
    })
  }, [minDate, maxDate])

  type TAddNewTypeSchema = v.InferInput<typeof ActivitySchema>

  const initialValue = useMemo(() => ({ date: minDate, input: 0, desc: '' }), [])

  const form = useForm<TAddNewTypeSchema>({
    values: type === 'edit' ? { date: new Date(data.date), input: data.input, desc: data.desc } : initialValue,
    resolver: valibotResolver(ActivitySchema),
  })

  const mutation = useMutation(
    WasteGeneratedApi.activities.mutationOption({
      type,
      onSuccess: () => {
        q$.invalidateQuery(WasteGeneratedApi.activities.optimize.qk({ wasteGeneratedId: row.id, year, month }))
        onCancel()
      },
    }),
  )

  const onCancel = () => secondaryAction?.()

  const onSubmit = (values) => {
    const date = format(new Date(values.date), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")

    mutation.mutate(
      type === 'create' ? { ...values, date, wasteGeneratedId: row.id } : { id: data.id, ...values, date },
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ErrorMutation mutation={mutation} className='px-6 pt-6 pb-0' />

        <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                    min={minDate}
                    max={maxDate}
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
            name='input'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Input
                  <span className='ml-2 text-muted-foreground'>(ton)</span>
                </FormLabel>
                <FormControl>
                  <InputNumber {...field} placeholder='avg days' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='desc'
            render={({ field }) => (
              <FormItem className='md:col-span-2'>
                <FormLabel>Description:</FormLabel>
                <FormControl>
                  <Textarea placeholder='Tell us a bit about the activity' className='resize-none' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter className='flex flex-row justify-end space-x-2 py-4 px-4 border-t border-gray-300 dark:border-gray-700 sticky bottom-[-1px] bg-background'>
          {type === 'edit' ?
            <Button variant='secondary' type='button' onClick={onCancel}>
              Cancel
            </Button>
          : null}

          <Button disabled={mutation.isPending} type='submit' className='flex gap-x-2'>
            {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
            Save
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
