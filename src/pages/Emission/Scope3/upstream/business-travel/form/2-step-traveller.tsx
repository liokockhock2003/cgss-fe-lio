import { FormSelectEmployeeRegistry } from '@/components/reusable-forms/FormSelectEmployeeRegistry.tsx'
import { Button } from '@/components/ui/button.tsx'
import { FormField, FormMessage } from '@/components/ui/form.tsx'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/subnav-accordion.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { cn } from '@/utilities/cn.ts'
import { omit } from 'lodash-es'
import { ChevronRight, Files, Trash } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import * as v from 'valibot'
import { TravelLogs } from './2-step-traveller-log.tsx'
import { BusinessTravelSchema, TBusinessTravelSchema } from './common.tsx'

export function _2StepTravellersInfo() {
  const logSchema = BusinessTravelSchema.entries.travelers.item.entries.logs
  const form = useFormContext<TBusinessTravelSchema>()
  const travellerForm = useFieldArray({ control: form.control, name: 'travelers' })

  const handleDeleteRow = (index: number) => {
    travellerForm.remove(index)
  }

  const handleAddNewTraveller = () =>
    travellerForm.prepend({ employeeRegistryId: undefined, businessTravelId: form.getValues()?.id ?? undefined, logs: [], }) // prettier-ignore

  const handleDuplicate = (traveller: (typeof travellerForm.fields)[number], index: number) => {
    travellerForm.insert(index + 1, omit({ ...traveller, employeeRegistryId: undefined }, ['employeeRegistry']))
  }

  if (travellerForm.fields.length === 0) {
    return (
      <div className='flex justify-center items-center flex-col gap-4'>
        <IconCustomEmptyState className='w-20 h-20' />
        <p className='text-lg'> No travelers yet. Please add a traveler.</p>

        <Button type='button' className='text-sm flex gap-2' size='sm' onClick={handleAddNewTraveller}>
          Add new traveller
        </Button>

        <FormField render={() => <FormMessage />} name='travelers' />
      </div>
    )
  }

  return (
    <div className='flex items-center justify-center flex-col'>
      <div className='ml-auto'>
        <Button type='button' className='text-sm self-start flex gap-2' size='sm' onClick={handleAddNewTraveller}>
          Add new traveller
        </Button>
      </div>

      <Accordion
        type='single'
        // value='123'
        collapsible
        className='w-full'>
        {travellerForm.fields.map((traveller, travellerIndex) => {
          const logs = form.watch(`travelers.${travellerIndex}.logs` as 'travelers.0.logs')

          return (
            <AccordionItem
              key={traveller.id}
              // value={travellerIndex === 0 ? '123': traveller.id}
              value={traveller.id}
              className={cn(travellerIndex === travellerForm.fields.length - 1 ? 'border-b-0' : '')}>
              <div className='flex items-center py-1.5'>
                <div className='flex items-center gap-x-1'>
                  <AccordionTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='flex items-center justify-center [&[data-state=open]>svg]:rotate-90 [&[data-state=open]>svg]:transition-all [&[data-state=open]>svg]:transform'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ChevronRight className='size-5' />
                        </TooltipTrigger>
                        <TooltipContent side='top'>Toggle logs</TooltipContent>
                      </Tooltip>
                    </Button>
                  </AccordionTrigger>

                  <div className='[&>div>label]:hidden [&>div>button]:mt-0! justify-between items-center '>
                    <FormField
                      name={`travelers.${travellerIndex}`}
                      control={form.control}
                      render={() => <FormSelectEmployeeRegistry />}
                    />

                    <FormField name={`travelers.${travellerIndex}.logs`} render={() => <FormMessage />} />
                  </div>
                </div>

                <div className='flex gap-1 ml-auto'>
                  {v.safeParse(logSchema, logs).success ?
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDuplicate(traveller, travellerIndex)}
                          type='button'>
                          <Files className='size-5' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side='top'>Duplicate logs</TooltipContent>
                    </Tooltip>
                  : null}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' onClick={() => handleDeleteRow(travellerIndex)} type='button'>
                        <Trash className='size-5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side='top'>Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <AccordionContent>
                <TravelLogs index={travellerIndex} />
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

/*
// lets work on dnd
import { ButtonMoveUpDown } from '@/components/ButtonMoveUpDown.tsx'

const moveTo = (dir: 'top' | 'bottom', index: number) => () => {
  if (index === 0 && dir === 'top') return
  if (travellerForm.fields.length - 1 === index && dir === 'bottom') return

  const [indexA, indexB] = dir === 'bottom' ? [index, index + 1] : [index - 1, index]
  travellerForm.swap(indexA, indexB)
}

<ButtonMoveUpDown
  propsUpAction={{ onClick: moveTo('top', index), disabled: index === 0 }}
  propsDownAction={{
    onClick: moveTo('bottom', index),
    disabled: travellerForm.fields.length - 1 === index,
  }}
/>*/
