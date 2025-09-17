import { ErrorMutation } from '@/components/Errors.tsx'
import { GetDistanceWithGoogleMapApi } from '@/components/GetDistanceWithGoogleMapApi.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import {
  FormFuelTypeAndVehicleType,
  FormFuelTypeAndVehicleTypeLoading,
} from '@/components/reusable-forms/FormFuelTypeAndVehicleType.tsx'
import { FormSelectCompanyAddresses } from '@/components/reusable-forms/FormSelectCompanyAddresses.tsx'
import { Button } from '@/components/ui/button.tsx'
import { DateTimeInput } from '@/components/ui/datetime-input.tsx'
import { DateTimePicker } from '@/components/ui/datetime-picker.tsx'
import { DialogFooter } from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { InputNumber } from '@/components/ui/input-number.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { q$ } from '@/store'
import { EmployeeRegistryQuery } from '@/store/query/employee-registry.ts'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { format, endOfMonth, startOfMonth } from 'date-fns'
import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { EmployeeCommutingApi, TEmployeeCommuting } from '../api.ts'
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
  data?: TEmployeeCommuting['activities']
  rowColumnInfo: DialogActivityPayload
}) {
  const { row, columnDef } = rowColumnInfo
  const { year, month } = columnDef.meta?.columnInfo ?? { year: 0, month: 0 }
  const [minDate, maxDate] = [startOfMonth(new Date(year, month - 1)), endOfMonth(new Date(year, month - 1))]

  const employeeInfoQuery = EmployeeRegistryQuery.useEmployeeById(row.employeeRegistryId)

  const ActivitySchema = useMemo(() => {
    return v.object({
      date: v.pipe(v.date(), v.minValue(minDate), v.maxValue(maxDate)),
      input: v.pipe(v.number(), v.minValue(0), v.maxValue(31)),
      desc: v.pipe(
        v.string(),
        v.nonEmpty('Please enter your "description"'),
        v.maxLength(300, 'Your "description" is too long.'),
      ),
      metadata: v.object({
        distance: v.pipe(v.number(), v.minValue(0), v.maxValue(1000, 'Your "distance" is too long.')),
        addressFrom: v.pipe(
          v.string(),
          v.nonEmpty('Please enter your "address"'),
          v.maxLength(150, 'Your "address" is too long.'),
        ),
        addressTo: v.pipe(
          v.string(),
          v.nonEmpty('Please enter your "Office Address"'),
          v.maxLength(150, 'Your "Office Address" is too long.'),
        ),
        fuelType: v.pipe(v.string(), v.nonEmpty('Please enter your "fuel type"')), // not stored in DB
        EF_MobileCombustionDistanceId: v.pipe(v.string(), v.nonEmpty('Please enter your "vehicle type"')),
      }),
    })
  }, [minDate, maxDate])

  type TAddNewTypeSchema = v.InferInput<typeof ActivitySchema>

  const initialValue = useMemo(
    () => ({
      date: minDate,
      input: employeeInfoQuery.data.avg_day_working_per_month,
      desc: 'manual input',
      metadata: {
        distance: employeeInfoQuery.data.distance,
        addressFrom: employeeInfoQuery.data.addressFrom,
        addressTo: employeeInfoQuery.data.addressTo,
        fuelType: undefined,
        EF_MobileCombustionDistanceId: employeeInfoQuery.data.EF_MobileCombustionDistanceId,
      },
    }),
    [employeeInfoQuery, minDate],
  )

  const form = useForm<TAddNewTypeSchema>({
    values:
      type === 'edit' ?
        {
          date: new Date(data.date),
          input: data.input,
          desc: data.desc,
          metadata: {
            distance: data.metadata.distance,
            addressFrom: data.metadata.addressFrom,
            addressTo: data.metadata.addressTo,
            fuelType: undefined,
            EF_MobileCombustionDistanceId: data.metadata.EF_MobileCombustionDistanceId,
          },
        }
      : initialValue,
    resolver: valibotResolver(ActivitySchema),
  })

  const mutation = useMutation(
    q$.scope._3.employeeCommuting.activities.mutationOption({
      type,
      onSuccess: () => {
        q$.invalidateQuery(EmployeeCommutingApi.activities.optimize.qk({ employeeCommutingId: row.id, year, month }))
        onCancel()
      },
    }),
  )

  const onCancel = () => secondaryAction?.()

  const onSubmit = (values) => {
    const date = format(new Date(values.date), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")

    mutation.mutate(
      type === 'create' ? { ...values, date, employeeCommutingId: row.id } : { id: data.id, ...values, date },
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
                <FormLabel>Avg days working per month</FormLabel>
                <FormControl>
                  <InputNumber {...field} placeholder='avg days' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='metadata.addressFrom'
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Address :</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='246 Jalan 7/149J Bandar Baru Sri Petaling, 51300, Wilayah Persekutuan, Kuala Lumpur'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelectCompanyAddresses k='metadata.addressTo' form={form} />

          <FormField
            name='metadata'
            control={form.control}
            render={() => (
              <Suspense fallback={<FormFuelTypeAndVehicleTypeLoading />}>
                <FormFuelTypeAndVehicleType />
              </Suspense>
            )}
          />

          <FormField
            control={form.control}
            name='metadata.distance'
            render={({ field }) => (
              <FormItem className='md:col-span-2'>
                <FormLabel className='flex justify-between items-center'>
                  <div className='flex flex-col gap-1'>
                    <span>
                      Distance from address to working address <span className='text-sm'>(in Km)</span>
                    </span>
                    <span className='text-muted-foreground'>(From home to working place and back to home)</span>
                  </div>
                  <GetDistanceWithGoogleMapApi />
                </FormLabel>
                <FormControl>
                  <InputNumber {...field} placeholder='distance in km' />
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
