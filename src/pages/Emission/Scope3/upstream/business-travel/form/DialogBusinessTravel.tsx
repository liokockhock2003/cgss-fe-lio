import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { ErrorMutation } from '@/components/Errors.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { FormCheckboxCreateAnother } from '@/components/reusable-forms/FormCheckboxCreateAnother.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Form } from '@/components/ui/form.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { toast } from '@/components/ui/use-toast.ts'
import { q$ } from '@/store'
import { actionMappings } from '@/utilities/action-mapping.ts'
import { axios } from '@/utilities/axios-instance'
import { cn } from '@/utilities/cn.ts'
import { valibotResolver } from '@hookform/resolvers/valibot'
import type { DefaultError } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { BusinessTravelApi, TBusinessTravelMain } from '../api.ts'
import { useBusinessTravel } from '../context.tsx'
import { _1StepGeneralTravelInfo } from './1-step-general-travel-info.tsx'
import { _2StepTravellersInfo } from './2-step-traveller.tsx'
import { useStepper, steps, utils, filterParams, payloadSchema, type TBusinessTravelSchema } from './common.tsx'

DialogBusinessTravel.modalId = 'dialog-business-travel-form'
export function DialogBusinessTravel({
  onClose,
  data: modalPayload,
}: {
  onClose: () => void
  data?: { type: 'create' | 'duplicate' | 'edit'; id: number }
}) {
  const { queryKey } = useBusinessTravel()
  const { from } = queryKey[2]
  const action = actionMappings[modalPayload?.type ?? 'create']

  const stepper = useStepper()
  const currentIndex = utils.getIndex(stepper.current.id)

  const form = useForm<TBusinessTravelSchema>({
    defaultValues: {
      groupById: undefined,
      purpose: '',
      desc: '',
      date: from,
      travelers: [],
      createAnother: false,
    },
    resolver: valibotResolver(stepper.current.schema),
  })

  const businessTravelQuery = useQuery({
    enabled: action.base !== 'create',
    staleTime: 0,
    ...BusinessTravelApi.main.detail(modalPayload?.id, {
      onSuccess: (response: TBusinessTravelMain['detail']) => {
        const travelers = response?.travelers ?? []
        form.setValue('id', response.id)
        form.setValue('groupById', response.groupById)
        form.setValue('purpose', response.purpose)
        form.setValue('date', new Date(response.date))
        form.setValue('desc', response.desc)
        form.setValue('travelers', travelers)

        if (action.base === 'duplicate') {
          form.setValue('id', undefined)
          form.setValue('purpose', '[Duplicate] ' + response.purpose)
          form.setValue(
            'travelers',
            travelers.map(({ id, businessTravelId, ..._ }) => _),
          )
        }

        return response
      },
    })(filterParams),
  })

  const mutation = useMutation<unknown, DefaultError, TBusinessTravelSchema>({
    mutationFn: async (payload) => axios.post('/emission-scope3-business-travel/optimize', payload),
    onSuccess: () => {
      toast({ description: `Business Travel ${action.past_tense}` })

      if (form.getValues().createAnother) {
        form.reset({ createAnother: true })
        stepper.reset()
      } else {
        // handleCloseModal()
        onClose()
        q$.invalidateQuery([...queryKey])
      }

      if (action.base === 'create') form.reset()
    },
  })

  return (
    <Form {...form}>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className='max-w-lg md:max-w-5xl'>
          <form
            className='overflow-hidden flex flex-col'
            onSubmit={form.handleSubmit(async () => {
              if (stepper.isLast) {
                const result = v.safeParse(payloadSchema, form.getValues())

                if (result.success) {
                  mutation.mutate(result.output)
                } else {
                  console.log('Error:', result.issues)
                  result.issues.forEach((issue) => {
                    const issuePath = v.getDotPath(issue)
                    form.setError(issuePath as never, { message: issue.message })
                  })
                }
              } else {
                stepper.next()
              }
            })}>
            <DialogHeader>
              <DialogTitle>{action.label} Business Travel</DialogTitle>
              <DialogDescription>{stepper.current.description}</DialogDescription>
            </DialogHeader>

            <ErrorMutation mutation={mutation} className='pb-0!' />

            <div className='p-6 overflow-y-auto'>
              {businessTravelQuery.isLoading ?
                <Loading2 className=' h-10 w-10 transition-all' />
              : businessTravelQuery.isError ?
                <ErrorBoundary query={businessTravelQuery} />
              : <>
                  <nav aria-label='Checkout Steps' className='group my-5'>
                    <ol
                      className='flex items-center justify-between gap-2 max-w-lg mx-auto'
                      aria-orientation='horizontal'>
                      {stepper.all.map((step, index, array) => {
                        const isCurrentStep = stepper.current.id === step.id

                        return (
                          <Fragment key={step.id}>
                            <li className='flex items-center gap-4 shrink-0'>
                              <Button
                                type='button'
                                role='tab'
                                variant={index <= currentIndex ? 'default' : 'secondary'}
                                aria-current={isCurrentStep ? 'step' : undefined}
                                aria-posinset={index + 1}
                                aria-setsize={steps.length}
                                aria-selected={isCurrentStep}
                                className={cn(
                                  'flex size-10 items-center justify-center rounded-full',
                                  isCurrentStep ? 'bg-primary' : '',
                                )}
                                onClick={() => stepper.goTo(step.id)}>
                                {index + 1}
                              </Button>
                              <span className='text-sm font-medium'>{step.title}</span>
                            </li>
                            {index < array.length - 1 && (
                              <Separator className={`flex-1 ${index <= currentIndex ? 'bg-primary' : 'bg-muted'}`} />
                            )}
                          </Fragment>
                        )
                      })}
                    </ol>
                  </nav>
                  {stepper.current.id &&
                    stepper.switch({
                      'general-info': () => <_1StepGeneralTravelInfo />,
                      travellers: () => <_2StepTravellersInfo />,
                    })}
                </>
              }
            </div>

            <DialogFooter>
              {action.base === 'create' && <FormCheckboxCreateAnother />}

              <div className='flex justify-end gap-4'>
                <Button type='button' variant='secondary' onClick={stepper.prev} disabled={stepper.isFirst}>
                  Back
                </Button>

                <Button type='submit' disabled={mutation.isPending} className='flex gap-x-2'>
                  {mutation.isPending && <Loading2 className='text-current h-5 w-5 transition-all' />}
                  {stepper.isLast ? action.label : 'Next'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  )
}
