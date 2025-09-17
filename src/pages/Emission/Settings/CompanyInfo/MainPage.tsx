import { isAccessible } from '@/components/LayoutNewDashbord/isPriorityAccessible.tsx'
import { ReloadQuery } from '@/components/ReloadQuery.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { TableColumnView } from '@/components/tanstack-table/table-column-view.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { tableColumnDef } from '@/pages/Emission/Settings/CompanyInfo/TableColumnDef.tsx'
import { useAuthUser } from '@/store'
import { Priority } from '@/store/authUser.context.ts'
import { CompanyInfoQuery, type CompanyInfoResponse } from '@/store/query/company-info.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Navigate } from 'react-router-dom'
import { CompanyInfoForm } from './Form.tsx'

CompanyInfoPage.displayName = 'CompanyInfoPage'
function CompanyInfoPage() {
  const { authUser } = useAuthUser()
  const isAllowed = isAccessible(authUser.priority)(Priority.root)

  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ create: boolean }>({ create: false })
  const [sorting, onSortingChange] = useState<SortingState>([])
  const [columnVisibility, onColumnVisibilityChange] = useState({})

  const queryKey = [CompanyInfoQuery.uniqueKey] as const
  const query = useQuery<CompanyInfoResponse[]>({
    placeholderData: keepPreviousData,
    queryKey,
    queryFn: async () => await axios.get(`/${CompanyInfoQuery.uniqueKey}`).then((i) => i.data),
  })

  const defaultData = useMemo(() => [], [])
  const table = useReactTable({
    columns: tableColumnDef,
    data: query.data ?? defaultData,
    state: { sorting, columnVisibility },
    initialState: { columnPinning: { left: ['name'], right: ['actions'] } },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange,
    onColumnVisibilityChange,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
  })

  if (!isAllowed) {
    return <Navigate to='/emission/dashboard' />
  }

  return (
    <>
      <Card className='h-full flex flex-col'>
        <CardHeader className='flex flex-row items-center justify-between gap-2 flex-wrap'>
          <CardTitle className='flex items-center gap-2 mb-0'>Company Info</CardTitle>

          <div className='flex items-center gap-2'>
            <ReloadQuery query={query} />

            <Button onClick={() => handleOpenChangeWith('create', true)}>Add new Company</Button>

            <TableColumnView table={table} colStrategy='getAllFlatColumns' />
          </div>
        </CardHeader>

        <CardContent className='h-full flex-1'>
          <DataTable table={table} />
        </CardContent>
      </Card>

      {popoverStates.create && <CompanyInfoForm onClose={() => handleOpenChangeWith('create', false)} />}
    </>
  )
}

export const Component = CompanyInfoPage
