import { AlertDeleteDialog } from '@/components/AlertDeleteDialog.tsx'
import { ChemicalSymbol } from '@/components/common-icon.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { queryClient } from '@/store/query/query-client.ts'
import { valueFormatter } from '@/utilities/formatter.ts'
import { useCan } from '@/utilities/use-can'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ArrowRightLeft, Briefcase, House, Pencil, X } from 'lucide-react'
import { Dispatch } from 'react'
import { EmployeeCommutingApi, TEmployeeCommuting } from '../api.ts'
import { DialogActivityPayload } from './Dialog.tsx'

ActivityList.displayName = 'EmployeeCommuting ActivityList'
export function ActivityList({
  data,
  setCurrentEdit,
  rowColumnInfo,
}: {
  data: TEmployeeCommuting['activities']
  rowColumnInfo: DialogActivityPayload
  setCurrentEdit: Dispatch<unknown>
}) {
  const { popoverStates, handleOpenChangeWith } = usePopoverStates({ isDeleting: undefined })
  const { row, columnDef } = rowColumnInfo
  const { year, month } = columnDef.meta?.columnInfo ?? { year: 0, month: 0 }
  const canUpdate = useCan({ permission: 'scope3.employee-commuting.update', groupById: row.groupById })
  const canDelete = useCan({ permission: 'scope3.employee-commuting.delete', groupById: row.groupById })

  const deleteMutation = useMutation(
    EmployeeCommutingApi.activities.mutationOption({
      type: 'delete',
      onSuccess: async () => {
        handleOpenChangeWith('isDeleting', false)
        await queryClient.invalidateQueries({
          queryKey: EmployeeCommutingApi.activities.optimize.qk({ employeeCommutingId: row.id, year, month }),
        })
        await queryClient.invalidateQueries({ queryKey: ['dashboard', 'emission-intensity'] })
      },
    }),
  )

  return (
    <div className='p-4'>
      <div className='text-sm absolute -start-1.5 flex w-full'>
        <time className='z-1 px-2 py-1 bg-gray-300 rounded-e-full border border-white dark:border-gray-900 dark:bg-gray-700 group-hover:bg-primary'>
          {format(new Date(data.date), 'do')}
        </time>
        <div className='absolute start-4 pr-2 py-1 pl-10 bg-gray-300 rounded-e-full border border-white dark:border-gray-900 dark:bg-gray-700 group-hover:bg-primary'>
          {valueFormatter(data.input)} days/per month
        </div>

        <div className='ml-auto flex gap-2 items-center'>
          <Button
            size='icon'
            variant='secondary'
            disabled={!canUpdate}
            className='hidden group-hover:flex rounded-full'
            onClick={() => {
              if (canUpdate) setCurrentEdit(data)
            }}>
            <Pencil className='size-2' />
          </Button>

          <Button
            size='icon'
            variant='destructive'
            disabled={!canDelete}
            className='hidden group-hover:flex rounded-full'
            onClick={() => {
              if (canDelete) handleOpenChangeWith('isDeleting', true)
            }}>
            <X className='size-2' />
          </Button>
        </div>
      </div>

      <div className='pt-10 text-base font-normal text-gray-500 dark:text-gray-400'></div>

      <div className='space-y-2'>
        <div className='flex gap-2'>
          <Badge variant='secondary' className='flex gap-1'>
            From
            <House className='size-5' />: {data.metadata.addressFrom}
          </Badge>

          <div className='flex flex-col-reverse items-center'>
            <ArrowRightLeft className='size-5' />
            {valueFormatter(data.metadata.distance)}km
          </div>

          <Badge variant='secondary' className='flex gap-1'>
            To
            <Briefcase className='size-5' />: {data.metadata.addressTo}
          </Badge>
        </div>

        <p className='mt-5'>Using {data.metadata.EF_MobileCombustionDistanceId} to commute to work and back to home</p>
        <p className=''>{data.desc ?? ''}</p>

        <div className='flex flex-wrap gap-2'>
          <Badge variant='outline' className='w-max'>
            {ChemicalSymbol('CO2')} : {valueFormatter(data.CO2)}
          </Badge>
          <Badge variant='outline' className='w-max'>
            {ChemicalSymbol('N2O')}: {valueFormatter(data.N2O)}
          </Badge>
          <Badge variant='outline' className='w-max'>
            {ChemicalSymbol('CH4')}: {valueFormatter(data.CH4)}
          </Badge>
          <Badge variant='outline' className='w-max'>
            {ChemicalSymbol('TONCO2E')} : {valueFormatter(data.CO2E)}
          </Badge>
        </div>
      </div>

      {popoverStates.isDeleting && (
        <AlertDeleteDialog
          mutation={deleteMutation}
          onClose={() => handleOpenChangeWith('isDeleting', false)}
          handleDelete={async () => deleteMutation.mutate({ id: data.id })}
        />
      )}
    </div>
  )
}
