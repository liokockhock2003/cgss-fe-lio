import { ErrorMutation } from '@/components/Errors.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import {
  FormFuelTypeAndVehicleType,
  FormFuelTypeAndVehicleTypeLoading,
} from '@/components/reusable-forms/FormFuelTypeAndVehicleType.tsx'
import { FormStatus } from '@/components/reusable-forms/FormStatus.tsx'
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
import { Input } from '@/components/ui/input.tsx'
import { q$ } from '@/store'
import type { MobileRegistryResponse } from '@/store/query/mobile-registry.ts'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation } from '@tanstack/react-query'
import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

const GroupBySchema = v.object({
  id: v.optional(v.number()),
  identity_no: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your "identity no"'),
    v.maxLength(30, 'Your "identity no" is too long.'),
  ),
  model: v.pipe(v.string(), v.nonEmpty('Please enter your "model"'), v.maxLength(30, 'Your "model" is too long.')),
  EF_MobileCombustionDistanceId: v.pipe(v.string(), v.nonEmpty('Please enter your "vehicle type"')),
  fuelType: v.pipe(v.string(), v.nonEmpty('Please enter your "fuel type"')),
  status: v.union([v.literal('on'), v.literal('off')]),
})

export type TGroupBySchema = v.InferInput<typeof GroupBySchema>

MobileRegistryForm.displayName = 'MobileRegistryForm'
export function MobileRegistryForm(props: { payload?: MobileRegistryResponse; onClose: () => void }) {
  const type = props.payload ? 'edit' : 'create'
  const form = useForm<TGroupBySchema>({
    defaultValues:
      props.payload ?
        {
          identity_no: props.payload.identity_no,
          model: props.payload.model,
          EF_MobileCombustionDistanceId: props.payload.EF_MobileCombustionDistanceId,
          status: props.payload.status === 'active' ? 'on' : 'off',
          id: props.payload?.id,
        }
      : { identity_no: '', model: '', EF_MobileCombustionDistanceId: '', status: 'on', fuelType: '' },
    resolver: valibotResolver(GroupBySchema),
  })

  const mutation = useMutation(q$.General.MobileRegistryQuery.mutationOption({ type }))

  return (
    <Form {...form}>
      <Dialog open onOpenChange={props.onClose}>
        <DialogContent>
          <form
            onSubmit={form.handleSubmit(() => {
              const { fuelType, ...payload } = form.getValues()
              mutation.mutate({ ...payload, status: form.getValues().status === 'on' ? 'active' : 'inactive' })

              props.onClose()
            })}>
            <DialogHeader>
              <DialogTitle>Add New Group</DialogTitle>
              <DialogDescription>eg: Department A, Team B or your own creativity</DialogDescription>
            </DialogHeader>

            <ErrorMutation mutation={mutation} />

            <DialogBody className='space-y-5'>
              <FormField
                control={form.control}
                name='identity_no'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Identity No <span className='text-sm'>(eg: plate no)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Identity no' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='model'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Model <span className='text-sm'>(eg: Maxda, Proton, Produa)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='Model' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Suspense fallback={<FormFuelTypeAndVehicleTypeLoading />}>
                <FormFuelTypeAndVehicleType />
              </Suspense>

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
