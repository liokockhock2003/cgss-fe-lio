import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { ReloadQuery } from '@/components/ReloadQuery.tsx'
import { SearchInput } from '@/components/SearchInput.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { TableColumnView } from '@/components/tanstack-table/table-column-view.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { MobileRegistryQuery, MobileRegistryResponse } from '@/store/query/mobile-registry.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { usePopoverStates } from '@/utilities/usePopoverStates.tsx'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFacetedRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import { EllipsisVertical, ExternalLink, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MobileRegistryForm } from './Form.tsx'
import { tableColumnDef } from './TableColumnDef'

function MobileRegistryPage() {
  const [columnVisibility, onColumnVisibilityChange] = useState({})
  const { popoverStates, handleOpenChangeWith } = usePopoverStates<{ create: boolean }>({ create: false })
  const [tableQueries, _, { onPaginationChange, onSortingChange }] = useTableQueries()

  const queryKey = [MobileRegistryQuery.uniqueKey, tableQueries] as const

  const query = useQuery<{ rows: MobileRegistryResponse[]; rowCount: number }>({
    queryKey,
    placeholderData: keepPreviousData,
    queryFn: async () =>
      await axios.get(`/${MobileRegistryQuery.uniqueKey}/optimize`, { params: tableQueries }).then((i) => i.data),
  })

  const defaultData = useMemo(() => [], [])
  const table = useReactTable({
    columns: tableColumnDef,
    data: query.data?.rows ?? defaultData,
    rowCount: query.data?.rowCount,
    initialState: { columnPinning: { left: ['identity_no'], right: ['actions'] } },
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
                  <div className='flex items-center mr-auto'>
                    <SearchInput placeholder='Search identity no or model...' />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' size='icon' className='@2xl/header:hidden mt-0!'>
                        <EllipsisVertical className='w-5' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <ReloadQuery view='dropdown-item' query={query} />

                      <DropdownMenuItem className='flex gap-4' onClick={() => handleOpenChangeWith('create', true)}>
                        <Plus className='size-4' />
                        Add new mobile
                      </DropdownMenuItem>

                      <TableColumnView view='dropdown-item' table={table} />

                      <DropdownMenuItem className='flex gap-4' asChild>
                        <Link to='/emission/scope1/mobile-combustion'>
                          <ExternalLink className='size-5' />
                          Scope1 Mobile Combustion
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className='items-center gap-x-2 hidden @2xl/header:flex'>
                    <ReloadQuery query={query} />

                    <Button onClick={() => handleOpenChangeWith('create', true)}>Add new mobile</Button>

                    <TableColumnView table={table} />

                    <Button className='flex gap-x-2 items-center' asChild variant='secondary'>
                      <Link to='/emission/scope1/mobile-combustion'>
                        <ExternalLink className='size-5' />
                        Scope1 Mobile Combustion
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

      {popoverStates.create && <MobileRegistryForm onClose={() => handleOpenChangeWith('create', false)} />}
    </>
  )
}

MobileRegistryPage.displayName = 'MobileRegistryPage'
export const Component = MobileRegistryPage
