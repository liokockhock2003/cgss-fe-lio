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
import { Pencil, X } from 'lucide-react'
import { Dispatch } from 'react'
import { StationaryCombustionApi, type TStationaryCombustion } from '../api.ts'
import { DialogActivityPayload } from './Dialog.tsx'

ActivityList.displayName = 'StationaryCombustion ActivityList'
export function ActivityList({
  data,
  setCurrentEdit,
  rowColumnInfo,
}: {
  data: TStationaryCombustion['activities']
  rowColumnInfo: DialogActivityPayload
  setCurrentEdit: Dispatch<unknown>
}) {
  const { popoverStates, handleOpenChangeWith } = usePopoverStates({ isDeleting: undefined })
  const { row, columnDef } = rowColumnInfo
  const { year, month } = columnDef.meta?.columnInfo ?? { year: 0, month: 0 }
  const canUpdate = useCan({ permission: 'scope1.stationary-combustion.update', groupById: row.groupById })
  const canDelete = useCan({ permission: 'scope1.stationary-combustion.delete', groupById: row.groupById })

  const deleteMutation = useMutation(
    StationaryCombustionApi.activities.mutationOption({
      type: 'delete',
      onSuccess: async () => {
        handleOpenChangeWith('isDeleting', false)
        await queryClient.invalidateQueries({
          queryKey: StationaryCombustionApi.activities.optimize.qk({ stationaryCombustionId: row.id, year, month }),
        })
        await queryClient.invalidateQueries({ queryKey: ['dashboard', 'emission-intensity'] })
      },
    }),
  )

  // TEMP FIX
  const displayUnit = row.type.state === 'gas' ? 'GJ' : row.type.unit

  return (
    <div className='p-4'>
      <div className='text-sm absolute -start-1.5 flex w-full'>
        <time className='z-1 px-2 py-1 bg-gray-300 rounded-e-full border border-white dark:border-gray-900 dark:bg-gray-700 group-hover:bg-primary'>
          {format(new Date(data.date), 'do')}
        </time>
        <div className='absolute start-4 pr-2 py-1 pl-10 bg-gray-300 rounded-e-full border border-white dark:border-gray-900 dark:bg-gray-700 group-hover:bg-primary'>
          {valueFormatter(data.input)}
          {` `}
          {displayUnit}
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

      <div className='space-y-2'>
        <p className='pt-10 text-base font-normal text-gray-500 dark:text-gray-400'>{data.desc ?? ''}</p>

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
