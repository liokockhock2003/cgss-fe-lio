import { ErrorMutation } from '@/components/Errors.tsx'
import { GetDistanceWithGoogleMapApi } from '@/components/GetDistanceWithGoogleMapApi.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { FormCheckboxCreateAnother } from '@/components/reusable-forms/FormCheckboxCreateAnother.tsx'
import {
  FormFuelTypeAndVehicleType,
  FormFuelTypeAndVehicleTypeLoading,
} from '@/components/reusable-forms/FormFuelTypeAndVehicleType.tsx'
import { FormSelectGroupBy } from '@/components/reusable-forms/FormSelectGroupBy.tsx'
import { Button } from '@/components/ui/button.tsx'
import { DateTimeInput } from '@/components/ui/datetime-input.tsx'
import { DateTimePicker } from '@/components/ui/datetime-picker.tsx'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { InputNumber } from '@/components/ui/input-number.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { toast } from '@/components/ui/use-toast.ts'
import { q$ } from '@/store'
import { actionMappings } from '@/utilities/action-mapping.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { apiTransformed } from '@/utilities/to-humanize-digits.ts'
import { useModal } from '@/utilities/useModal.tsx'
import { valibotResolver } from '@hookform/resolvers/valibot'
import type { DefaultError } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { TUdtd, UdtdApi } from '../api.ts'
import { useUdtd } from '../context.tsx'
import { UdtdSchema } from './schema.tsx'

DialogUdtd.modalId = 'dialog-udtd'
export function DialogUdtd({ scopeType }: { scopeType: TUdtd['base']['type'] }) {
  const { queryKey } = useUdtd()
  const { from, to } = queryKey[2]
  const schema = useMemo(() => UdtdSchema({ from, to }), [from, to])

  const {
    payload: { type: actionType, payload },
    closeModal,
  } = useModal<
    | { type: 'create'; payload: undefined }
    | {
        type: 'edit' | 'duplicate'
        payload: TUdtd['base']
      }
  >()

  const action = actionMappings[actionType]

  const initialValue = useMemo(
    () => ({
      groupById: undefined,
      name: '',
      desc: '',
      date: from,
      type: scopeType,
      createAnother: true,
      metadata: { distance: 0, addressFrom: '', addressTo: '', fuelType: '', EF_MobileCombustionDistanceId: '' },
    }),
    [scopeType, from],
  )

  const form = useForm<v.InferInput<typeof schema>>({
    defaultValues:
      action.base === 'create' ?
        { ...initialValue, createAnother: false }
      : {
          id: payload.id,
          groupById: payload.groupById,
          name: (action.base === 'duplicate' ? '[Duplicate] ' : '') + payload.name,
          desc: payload.desc,
          date: new Date(payload.date),
          type: payload.type,
          createAnother: false,
          metadata: {
            distance: payload.metadata.distance,
            addressFrom: payload.metadata.addressFrom,
            addressTo: payload.metadata.addressTo,
            fuelType: '',
            EF_MobileCombustionDistanceId: payload.metadata.EF_MobileCombustionDistanceId,
          },
        },

    resolver: valibotResolver(schema),
  })

  const handleCloseModal = () => closeModal(DialogUdtd.modalId)

  const mutation = useMutation<unknown, DefaultError, v.InferInput<typeof schema>>({
    mutationFn: async (payload) => {
      // TODO: seems like need another refactoring with QueryFactory
      const [httpMethod, url, body] = apiTransformed(action.base, payload)
      return axios[httpMethod](`/${UdtdApi.main.uniqueKey + url} `, body)
    },
    onSuccess: () => {
      toast({ description: action.past_tense })

      if (form.getValues().createAnother) {
        form.reset({ ...initialValue, createAnother: true })
      } else {
        handleCloseModal()
        q$.invalidateQuery([...queryKey])
      }

      if (action.base === 'create') form.reset()
    },
  })

  const onSubmit = (values) => mutation.mutate(values)

  return (
    <Form {...form}>
      <Dialog open onOpenChange={handleCloseModal}>
        <DialogContent className='max-w-lg md:max-w-3xl flex flex-col max-h-[95vh]' aria-describedby={undefined}>
          <form className='overflow-hidden flex flex-col' onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {action.label} <span className='capitalize'>{scopeType}</span> Transportation & Distribution
              </DialogTitle>
            </DialogHeader>

            <ErrorMutation mutation={mutation} className='pb-0!' />

            <div className='p-6 overflow-y-auto space-y-4'>
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
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{scopeType === 'upstream' ? 'Supplier' : 'Customer'} Name:</FormLabel>
                    <FormControl>
                      <Input placeholder='Name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid md:grid-cols-2 gap-x-2'>
                <FormField
                  control={form.control}
                  name='metadata.addressFrom'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{scopeType === 'upstream' ? 'Supplier ' : 'Your'} Address :</FormLabel>
                      <FormControl>
                        <Textarea placeholder='please key in the detail' className='resize-none' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='metadata.addressTo'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{scopeType === 'upstream' ? 'Your' : 'To Customer'} Address :</FormLabel>
                      <FormControl>
                        <Textarea placeholder='please key in the detail' className='resize-none' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='metadata.distance'
                render={({ field }) => (
                  <FormItem className='md:col-span-2'>
                    <FormLabel className='flex justify-between items-center'>
                      <div className='flex items-center gap-1'>
                        Distance <span className='text-sm'>(in Km)</span>
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

              <div className='grid grid-cols-2 gap-x-2'>
                <FormField
                  name='metadata'
                  control={form.control}
                  render={() => (
                    <Suspense fallback={<FormFuelTypeAndVehicleTypeLoading />}>
                      <FormFuelTypeAndVehicleType />
                    </Suspense>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='desc'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description:<span className='ml-2 text-muted-foreground'>(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder='Tell us a bit about the activity' className='resize-none' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              {action.base === 'create' && <FormCheckboxCreateAnother />}
              <div className='flex justify-end gap-4'>
                <Button variant='secondary' type='button' onClick={handleCloseModal}>
                  Cancel
                </Button>

                <Button disabled={mutation.isPending} type='submit' className='flex gap-x-2'>
                  {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
                  {action.label}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  )
}
