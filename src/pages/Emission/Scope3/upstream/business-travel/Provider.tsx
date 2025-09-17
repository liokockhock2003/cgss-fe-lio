import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import { axios } from '@/utilities/axios-instance.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFacetedRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import { tableColumnDefs } from './TableColumnDef.tsx'
import { BusinessTravelApi } from './api.ts'
import { BusinessTravelContext } from './context.tsx'

BusinessTravelProvider.displayName = 'BusinessTravel Provider'
export function BusinessTravelProvider({ children }) {
  const [{ dateRange: [from, to], groupByIds }] = useGlobalFilter() // prettier-ignore
  const [tableQueries, _, { reset, onPaginationChange, onSortingChange }] = useTableQueries()

  useEffect(() => reset(), [from, to, groupByIds])
  const [columnVisibility, onColumnVisibilityChange] = useState({})
  const queryKey = [BusinessTravelApi.main.uniqueKey, 'optimize', { ...tableQueries, from, to, groupByIds }] as const

  const query = useQuery({
    placeholderData: keepPreviousData,
    queryKey,
    queryFn: async () => {
      const params = { groupByIds, ...tableQueries, ...isDebug(), from, to }
      return await axios.get(`/${BusinessTravelApi.main.uniqueKey}/optimize`, { params }).then((i) => i.data)
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
    columns: tableColumnDefs,
    data: query.data?.rows ?? defaultData,
    rowCount: query.data?.rowCount,
    state,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    initialState: { columnPinning: { left: ['purpose'], right: ['actions'] } },
    onSortingChange,
    onPaginationChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
  })

  const value = useMemo(() => ({ table, query, queryKey }), [queryKey])

  return <BusinessTravelContext.Provider value={value}>{children(value)}</BusinessTravelContext.Provider>
}
