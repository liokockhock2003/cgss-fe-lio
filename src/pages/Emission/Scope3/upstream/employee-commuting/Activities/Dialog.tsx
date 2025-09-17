import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { q$ } from '@/store'
import { MonthsHashed } from '@/utilities/ag-grid.helpers.ts'
import { useCan } from '@/utilities/use-can'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'
import { Suspense, useState } from 'react'
import { EmployeeCommutingApi, TEmployeeCommuting } from '../api.ts'
import { useEmployeeCommuting } from '../context.tsx'
import { ActivityForm } from './Form.tsx'
import { ActivityList } from './List.tsx'

export type DialogActivityPayload = {
  row: TEmployeeCommuting['main']['base']
  columnDef: ColumnDef<TEmployeeCommuting['main']['base']>
}

DialogActivity.displayName = 'EmployeeCommuting DialogActivity'
export function DialogActivity({
  onClose,
  rowColumnInfo,
}: {
  rowColumnInfo: DialogActivityPayload
  onClose: () => void
}) {
  const { queryKey } = useEmployeeCommuting()
  const [currentEdit, setCurrentEdit] = useState(undefined)
  const { row, columnDef } = rowColumnInfo
  const { year, month } = columnDef.meta?.columnInfo ?? { year: 0, month: 0 }

  const query = useSuspenseQuery(
    EmployeeCommutingApi.activities.optimize.useQuery({
      payload: { employeeCommutingId: row.id, year, month },
    }),
  )
  const canCreate = useCan({ permission: 'scope3.employee-commuting.create', groupById: row.groupById })

  return (
    <Dialog
      open
      onOpenChange={(e) => {
        if (e === false) {
          q$.invalidateQuery([...queryKey])
        }

        onClose()
      }}>
      <DialogContent className='max-w-lg md:max-w-3xl flex flex-col max-h-[95vh]' aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className='flex items-center'>
            {row.groupBy.name}
            <ChevronRight className='h-4 w-4' />
            <span className='capitalize mr-1'>{MonthsHashed[month]}</span>
            {year} activities
          </DialogTitle>
          <div className='flex items-center gap-0.5 text-sm'>
            <p>{row.employeeRegistry.name}</p>
            <p>({row.employeeRegistry.staffId})</p>
          </div>
        </DialogHeader>

        <Tabs defaultValue='activities' className='flex flex-col flex-1 overflow-y-auto'>
          <div className='pt-6 px-6'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='activities'>Activities</TabsTrigger>
              <TabsTrigger value='create-new' disabled={!canCreate}>Create New Activity</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='activities' className='flex-1 overflow-y-auto p-6 mt-0!'>
            {query.isLoading ?
              <Loading2 className='text-current h-10 w-10' />
            : query.isError ?
              <ErrorBoundary query={query} />
            : query.data.length === 0 ?
              <div className='flex items-center justify-center flex-col gap-4'>
                <IconCustomEmptyState className='w-20 h-20' />
                <p className='text-lg'>Sorry no activities found</p>
              </div>
            : <ol className='relative overflow-y-auto flex-1 space-y-4'>
                {query.data.map((d) => (
                  <li className='group relative' key={d.id}>
                    <div className='border border-gray-300 dark:border-gray-700 rounded-lg'>
                      {currentEdit?.id === d.id ?
                        <Suspense fallback={<Loading2 className='h-5 w-5' />}>
                          <ActivityForm
                            type='edit'
                            data={d}
                            secondaryAction={() => setCurrentEdit(undefined)}
                            rowColumnInfo={rowColumnInfo}
                          />
                        </Suspense>
                      : <ActivityList data={d} setCurrentEdit={setCurrentEdit} rowColumnInfo={rowColumnInfo} />}
                    </div>
                  </li>
                ))}
              </ol>
            }
          </TabsContent>
          <TabsContent value='create-new' className='mt-0! p-6'>
            <Suspense fallback={<Loading2 className='h-5 w-5 m-10' />}>
              <ActivityForm type='create' rowColumnInfo={rowColumnInfo} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
