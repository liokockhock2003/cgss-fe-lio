import { ButtonMoveUpDown } from '@/components/ButtonMoveUpDown.tsx'
import {
  FormFuelTypeAndVehicleType,
  FormFuelTypeAndVehicleTypeLoading,
} from '@/components/reusable-forms/FormFuelTypeAndVehicleType.tsx'
import { FormSelectTypeDistanceOrLitre } from '@/components/reusable-forms/FormSelectTypeDistanceOrLitre.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Form, FormControl, FormField, FormItem, FormMessage, useFormField } from '@/components/ui/form.tsx'
import { InputNumber } from '@/components/ui/input-number.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Plus, Trash } from 'lucide-react'
import { Suspense } from 'react'
import { useFieldArray, UseFieldArrayReturn, useForm, useFormContext, UseFormReturn } from 'react-hook-form'
import * as v from 'valibot'
import style from './2-step-traveller-log.module.scss'
import { BusinessTravelSchema, TBusinessTravelSchema } from './common.tsx'

type DynamicFormName = 'addressFrom' | 'addressTo' | 'input' | 'type'
export type Log = TBusinessTravelSchema['travelers'][number]['logs'][number]

const defaultValues: Log = {
  addressFrom: '',
  addressTo: '',
  type: undefined,
  input: 0,
  EF_MobileCombustionDistanceId: '',
  fuelType: '',
}

export const TravelLogs = ({ index }: { index: number }) => {
  const logSchema = BusinessTravelSchema.entries.travelers.item.entries.logs

  const form = useFormContext<TBusinessTravelSchema>()
  const logsForm = useFieldArray({ name: `travelers[${index}].logs` })
  const createForm = useForm<Log>({ defaultValues, resolver: valibotResolver(logSchema.item) })

  return (
    <div className='rounded-md border overflow-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead />
            <TableHead>Vehicle</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Input</TableHead>
            <TableHead>Type</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {logsForm.fields.map((_, logIndex) => (
            <FormField
              key={_.id}
              name={`travelers.${index}.logs.${logIndex}`}
              control={form.control}
              render={() => <LogRow logsForm={logsForm} logIndex={logIndex} />}
            />
          ))}

          <Form {...createForm}>
            <LogRow logsForm={logsForm} createForm={createForm} />
          </Form>
        </TableBody>
      </Table>
    </div>
  )
}

export const LogRow = ({
  logsForm,
  logIndex,
  createForm,
}: {
  logIndex?: number
  createForm?: UseFormReturn<Log>
  logsForm: UseFieldArrayReturn
}) => {
  const logSchema = BusinessTravelSchema.entries.travelers.item.entries.logs
  const isCreate = logIndex === undefined
  const form = useFormContext<Log>()

  const parentContext = useFormField()
  const withName = (key: string) => ((parentContext.name ? `${parentContext.name}.` : '') + key) as DynamicFormName

  const onClick = async () => {
    if (isCreate) {
      if (await form.trigger()) {
        logsForm.append(v.parse(logSchema.item, createForm.getValues()))
        createForm.reset(defaultValues)
      }
    } else {
      logsForm.remove(logIndex)
    }
  }

  const moveTo = (dir: 'top' | 'bottom') => () => {
    if (logIndex === 0 && dir === 'top') return
    if (logsForm.fields.length - 1 === logIndex && dir === 'bottom') return

    const [indexA, indexB] = dir === 'bottom' ? [logIndex, logIndex + 1] : [logIndex - 1, logIndex]
    logsForm.swap(indexA, indexB)
  }

  return (
    <TableRow>
      <TableCell className='py-1.5 px-1'>
        {isCreate ? null : (
          <ButtonMoveUpDown
            propsUpAction={{ onClick: moveTo('top'), disabled: logIndex === 0 }}
            propsDownAction={{ onClick: moveTo('bottom'), disabled: logsForm.fields.length - 1 === logIndex }}
          />
        )}
      </TableCell>

      <TableCell className='py-1.5 px-1 overflow-x-hidden'>
        <div className={style.formFuelTypeAndVehicleTypeWrapper}>
          <FormField
            name={(parentContext?.name ?? '') as DynamicFormName}
            control={form.control}
            render={() => (
              <Suspense fallback={<FormFuelTypeAndVehicleTypeLoading />}>
                <FormFuelTypeAndVehicleType />
              </Suspense>
            )}
          />
        </div>
      </TableCell>

      <TableCell className='py-1.5 px-1'>
        <FormField
          name={withName(`addressFrom`)}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder='Enter Address From' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className='py-1.5 px-1'>
        <FormField
          name={withName(`addressTo`)}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder='Enter Address To' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className='py-1.5 px-1'>
        <FormField
          name={withName('input')}
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputNumber {...field} placeholder='Enter Input' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TableCell>

      <TableCell className='py-1.5 px-1 [&>div>label]:hidden [&>div>button]:mt-0!'>
        <FormSelectTypeDistanceOrLitre />
      </TableCell>

      <TableCell className='py-1.5 px-1 flex items-center justify-center gap-x-1'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' onClick={onClick} type='button'>
              {isCreate ?
                <Plus className='size-5' />
              : <Trash className='size-5' />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top'> {isCreate ? 'Add' : 'Delete'}</TooltipContent>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}
