import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { ReloadQuery } from '@/components/ReloadQuery.tsx'
import { SearchInput } from '@/components/SearchInput.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { TableColumnView } from '@/components/tanstack-table/table-column-view.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { EmployeeRegistryQuery, type EmployeeRegistryResponse } from '@/store/query/employee-registry.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFacetedRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import { EllipsisVertical, ExternalLink, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmployeeRegistryForm } from './Form.tsx'
import { tableColumnDef } from './TableColumnDef'

function EmployeeRegistryPage() {
  const [columnVisibility, onColumnVisibilityChange] = useState({})
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ create: boolean }>({ create: false })
  const [tableQueries, _, { onPaginationChange, onSortingChange }] = useTableQueries()

  const queryKey = [EmployeeRegistryQuery.uniqueKey, tableQueries] as const
  const query = useQuery<{ rows: EmployeeRegistryResponse[]; rowCount: number }>({
    placeholderData: keepPreviousData,
    queryKey,
    queryFn: async () =>
      await axios.get(`/${EmployeeRegistryQuery.uniqueKey}/optimize`, { params: tableQueries }).then((i) => i.data),
  })

  const defaultData = useMemo(() => [], [])
  const table = useReactTable({
    columns: tableColumnDef,
    data: query.data?.rows ?? defaultData,
    rowCount: query.data?.rowCount,
    initialState: { columnPinning: { left: ['name'], right: ['actions'] } },
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

  return (
    <>
      <Card className='h-full flex flex-col'>
        <CardContent className={'h-full flex-1'}>
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
                  <div className='flex flex-col justify-center mr-auto'>
                    <CardTitle className='flex items-center mb-2'>
                      <SearchInput placeholder='Search employee name...' />
                    </CardTitle>
                    <CardDescription className='flex-col @xs/header:hidden @md/header:flex'>
                      <span>{`Any changes made here will reflect on next update.`} </span>
                      <span>{`You'll have to manually update each Employee's activity`}</span>
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' size='icon' className='@3xl/header:hidden mt-0!'>
                        <EllipsisVertical className='w-5' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <ReloadQuery view='dropdown-item' query={query} />

                      <DropdownMenuItem className='flex gap-4' onClick={() => handleOpenChangeWith('create', true)}>
                        <Plus className='size-4' />
                        Add new employee
                      </DropdownMenuItem>

                      <TableColumnView view='dropdown-item' table={table} />

                      <DropdownMenuItem className='flex gap-4' asChild>
                        <Link to='/emission/scope3/upstream/employee-commuting'>
                          <ExternalLink className='size-5' />
                          Scope3 Employee Commuting
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className='items-center gap-x-2 hidden @3xl/header:flex'>
                    <ReloadQuery query={query} />

                    <Button onClick={() => handleOpenChangeWith('create', true)}>Add new employee</Button>

                    <TableColumnView table={table} />

                    <Button className='flex gap-x-2 items-center' asChild variant='secondary'>
                      <Link to='/emission/scope3/upstream/employee-commuting'>
                        <ExternalLink className='size-5' />
                        Scope3 Employee Commuting
                      </Link>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className='h-full flex-1'>
                  <DataTable table={table} />
                </CardContent>
              </>
            ),
          })}
        </CardContent>
      </Card>

      {popoverStates.create && (
        <EmployeeRegistryForm queryKey={queryKey} onClose={() => handleOpenChangeWith('create', false)} />
      )}
    </>
  )
}

EmployeeRegistryPage.displayName = 'EmployeeRegistryPage'
export const Component = EmployeeRegistryPage
