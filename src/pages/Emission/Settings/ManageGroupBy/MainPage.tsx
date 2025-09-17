import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { ReloadQuery } from '@/components/ReloadQuery.tsx'
import { SearchInput } from '@/components/SearchInput.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { TableColumnView } from '@/components/tanstack-table/table-column-view.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthUser } from '@/store'
import { Priority } from '@/store/authUser.context.ts'
import { GroupByQuery, GroupByResponse } from '@/store/query/group-by.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { keepPreviousData, type QueryKey, useQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFacetedRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import { Navigate } from 'react-router-dom'
import { ManageGroupByForm } from './Form.tsx'
import { tableColumnDef } from './TableColumnDef.tsx'
import { isAccessible } from '@/components/LayoutNewDashbord/isPriorityAccessible.tsx'

ManageGroupByPage.displayName = 'ManageGroupByPage'
function ManageGroupByPage() {
  const { authUser } = useAuthUser()
  const isAllowed = isAccessible(authUser.priority)(Priority.adminCompany)

  const [tableQueries, _, { onPaginationChange, onSortingChange }] = useTableQueries()

  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ create: boolean }>({ create: false })
  const [columnVisibility, onColumnVisibilityChange] = useState({})

  const queryKey: QueryKey = [GroupByQuery.uniqueKey, tableQueries]
  const query = useQuery<{ rows: GroupByResponse[]; rowCount: number }>({
    placeholderData: keepPreviousData,
    queryKey,
    queryFn: async () =>
      await axios.get(`/${GroupByQuery.uniqueKey}/optimize`, { params: tableQueries }).then((i) => i.data),
  })

  const defaultData = useMemo(() => [], [])
  const table = useReactTable({
    columns: tableColumnDef,
    data: query.data?.rows ?? defaultData,
    rowCount: query.data?.rowCount,
    initialState: { columnPinning: { right: ['actions'] } },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    state: {
      columnVisibility,
      sorting: tableQueries.sorting?.length > 0 ? tableQueries.sorting : [{ id: 'name', desc: true }],
      pagination: { pageIndex: tableQueries.pageIndex, pageSize: tableQueries.pageSize },
    },
    onSortingChange,
    onPaginationChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
  })

  if (!isAllowed) {
    return <Navigate to='/emission/dashboard' />
  }

  return (
    <>
      <Card className='h-full flex flex-col'>
        {matchQueryStatus(query, {
          Errored: (
            <div className='w-full p-5 px-10'>
              <ErrorBoundary query={query} />
            </div>
          ),
          Loading: <Loading2 />,
          Success: () => (
            <>
              <CardHeader
                className='flex flex-row items-center gap-2 @container/header space-y-0'
                style={{ contain: 'layout' }}>
                <CardTitle className='flex items-center mr-auto'>
                  <SearchInput placeholder='Search group by...' />
                </CardTitle>

                <div className='flex items-center gap-2'>
                  <ReloadQuery query={query} />

                  <Button onClick={() => handleOpenChangeWith('create', true)}>Add new group</Button>

                  <TableColumnView table={table} />
                </div>
              </CardHeader>

              <CardContent className='h-full flex-1'>
                <DataTable table={table} />
              </CardContent>
            </>
          ),
        })}
      </Card>

      {popoverStates.create && (
        <ManageGroupByForm queryKey={queryKey} onClose={() => handleOpenChangeWith('create', false)} />
      )}
    </>
  )
}

export const Component = ManageGroupByPage
