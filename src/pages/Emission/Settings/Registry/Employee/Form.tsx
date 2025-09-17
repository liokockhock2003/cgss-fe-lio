import { ErrorMutation } from '@/components/Errors.tsx'
import { GetDistanceWithGoogleMapApi } from '@/components/GetDistanceWithGoogleMapApi.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import {
  FormFuelTypeAndVehicleType,
  FormFuelTypeAndVehicleTypeLoading,
} from '@/components/reusable-forms/FormFuelTypeAndVehicleType.tsx'
import { FormSelectCompanyAddresses } from '@/components/reusable-forms/FormSelectCompanyAddresses.tsx'
import { FormStatus } from '@/components/reusable-forms/FormStatus.tsx'
import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { InputNumber } from '@/components/ui/input-number.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { q$ } from '@/store'
import { EmployeeRegistryResponse } from '@/store/query/employee-registry.ts'
import { queryClient } from '@/store/query/query-client'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { noop } from 'lodash-es'
import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

const EmployeeRegistrySchema = v.object({
  id: v.optional(v.number()),
  name: v.pipe(v.string(), v.nonEmpty('Please enter "name"'), v.maxLength(200, 'Your "name" is too long.')),
  staffId: v.optional(v.string()),
  distance: v.pipe(v.number(), v.minValue(0), v.maxValue(1000, 'Your "distance" is too long.')),
  avg_day_working_per_month: v.pipe(
    v.number(),
    v.minValue(0),
    v.maxValue(31, 'Your "average day working per month" is more than a average month'),
  ),
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
  status: v.union([v.literal('on'), v.literal('off')]),
})

export type TEmployeeRegistrySchema = v.InferInput<typeof EmployeeRegistrySchema>

EmployeeRegistryForm.displayName = 'MobileRegistryForm'
export function EmployeeRegistryForm(props: {
  queryKey: readonly [key: string, ReturnType<typeof useTableQueries>[0]]
  payload?: EmployeeRegistryResponse
  onClose: () => void
}) {
  const type = props.payload ? 'edit' : 'create'
  const form = useForm<TEmployeeRegistrySchema>({
    defaultValues:
      props.payload ?
        {
          name: props.payload.name,
          staffId: props.payload.staffId,
          distance: props.payload.distance,
          addressFrom: props.payload.addressFrom,
          addressTo: props.payload.addressTo,
          avg_day_working_per_month: props.payload.avg_day_working_per_month,
          EF_MobileCombustionDistanceId: props.payload.EF_MobileCombustionDistanceId,
          status: props.payload.status === 'active' ? 'on' : 'off',
          id: props.payload?.id,
        }
      : {
          name: '',
          distance: 0,
          addressFrom: '',
          addressTo: '',
          avg_day_working_per_month: 0,
          EF_MobileCombustionDistanceId: undefined,
          status: 'off',
        },
    resolver: valibotResolver(EmployeeRegistrySchema),
  })

  const mutation = useMutation(q$.General.EmployeeRegistryQuery.mutationOption({ type }))

  return (
    <Form {...form}>
      <Dialog open onOpenChange={props.onClose}>
        <DialogContent>
          <form
            className='overflow-hidden flex flex-col'
            onSubmit={form.handleSubmit(async () => {
              const { fuelType, ...payload } = form.getValues()
              const parsed = v.parse(v.omit(EmployeeRegistrySchema, ['fuelType']), payload)

              try {
                await mutation.mutateAsync({
                  ...parsed,
                  status: form.getValues().status === 'on' ? 'active' : 'inactive',
                })

                queryClient.invalidateQueries({ queryKey: props.queryKey })

                props.onClose()
              } catch {
                noop()
              }
            })}>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                This is list of employees, There will be no grouping here. Group will be handle on Employee Commuting
                side
              </DialogDescription>
            </DialogHeader>

            <ErrorMutation mutation={mutation} />

            <DialogBody className='space-y-5'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Employee name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='staffId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Staff Identity No:<span className='ml-2 text-muted-foreground'>(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='Staff ID' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                <FormField
                  control={form.control}
                  name='addressFrom'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Address :</FormLabel>
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

                <FormSelectCompanyAddresses k='addressTo' form={form} />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                <Suspense fallback={<FormFuelTypeAndVehicleTypeLoading />}>
                  <FormFuelTypeAndVehicleType />
                </Suspense>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                <FormField
                  control={form.control}
                  name='distance'
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
                  name='avg_day_working_per_month'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel className='flex justify-between items-center mb-auto'>
                        Average No of working days per month
                      </FormLabel>
                      <FormControl>
                        <InputNumber {...field} placeholder='no of average working days' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormStatus />
            </DialogBody>

            <DialogFooter>
              <Button variant='secondary' type='button' onClick={props.onClose}>
                Cancel
              </Button>

              <Button disabled={mutation.isPending} type='submit' className='flex gap-x-2'>
                {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
                {type === 'create' ? 'Add new' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  )
}
