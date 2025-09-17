import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import { axios } from '@/utilities/axios-instance.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFacetedRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import { useLocation } from 'react-router-dom'
import { tableColumnDef } from './TableColumnDef.tsx'
import { TUdtd, UdtdApi } from './api.ts'
import { UdtdContext } from './context.tsx'

UdtdProvider.displayName = 'Udtd Provider'
export function UdtdProvider({ children }) {
  const location = useLocation()
  const type = (
    location.pathname.includes('upstream-transportation-distribution') ?
      'upstream'
    : 'downstream') as TUdtd['base']['type']
  const [{ dateRange: [from, to], groupByIds }] = useGlobalFilter() // prettier-ignore
  const [tableQueries, _, { reset, onPaginationChange, onSortingChange }] = useTableQueries()
  useEffect(() => reset(), [from, to, groupByIds])

  const [columnVisibility, onColumnVisibilityChange] = useState({})
  const queryKey = [UdtdApi.main.uniqueKey, 'optimize', { ...tableQueries, from, to, groupByIds, type }] as const

  const query = useQuery({
    placeholderData: keepPreviousData,
    queryKey,
    queryFn: async (): Promise<TUdtd['response']> => {
      const params = { groupByIds, ...tableQueries, ...isDebug(), from, to, type }
      return await axios.get(`/${UdtdApi.main.uniqueKey}/optimize`, { params }).then((i) => i.data)
    },
  })

  const defaultData = useMemo(() => [], [])

  const state = useMemo(
    () => ({
      columnVisibility,
      sorting: tableQueries.sorting?.length > 0 ? tableQueries.sorting : [{ id: 'date', desc: true }],
      pagination: { pageIndex: tableQueries.pageIndex, pageSize: tableQueries.pageSize },
    }),
    [tableQueries, columnVisibility],
  )

  const table = useReactTable({
    columns: tableColumnDef,
    data: query.data?.rows ?? defaultData,
    rowCount: query.data?.rowCount,
    state,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    initialState: { columnPinning: { left: ['name'], right: ['actions'] } },
    onSortingChange,
    onPaginationChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
  })

  const value = useMemo(() => ({ table, query, queryKey, type }), [queryKey])

  return <UdtdContext.Provider value={value}>{children(value)}</UdtdContext.Provider>
}
