import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { DataTableEmptyStateWithFrozen } from '@/components/tanstack-table/data-table-empty-state-with-frozen.tsx'
import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import { axios } from '@/utilities/axios-instance.ts'
import { useGenerateListOfYearsAndMonths } from '@/utilities/table-activity-transformer.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFacetedRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import { tableColumnDef } from './TableColumnDef.tsx'
import { EmployeeCommutingApi, TEmployeeCommuting } from './api.ts'
import { EmployeeCommutingContext } from './context.tsx'

EmployeeCommutingProvider.displayName = 'EmployeeCommuting Provider'
export function EmployeeCommutingProvider({ children }) {
  const [{ dateRange: [from, to], groupByIds }] = useGlobalFilter() // prettier-ignore
  const [tableQueries, _, { reset, onPaginationChange, onSortingChange }] = useTableQueries()
  useEffect(() => reset(), [from, to, groupByIds])

  const [columnVisibility, onColumnVisibilityChange] = useState({})
  const queryKey = [EmployeeCommutingApi.main.uniqueKey, 'optimize', { ...tableQueries, from, to, groupByIds }] as const

  const query = useQuery({
    placeholderData: keepPreviousData,
    queryKey,
    queryFn: async (): Promise<TEmployeeCommuting['main']['response']> => {
      const params = { groupByIds, ...tableQueries, ...isDebug(), from, to }
      return await axios.get(`/${EmployeeCommutingApi.main.uniqueKey}/optimize`, { params }).then((i) => i.data)
    },
  })

  const defaultData = useMemo(() => [], [])
  const listOfYearsAndMonths = useGenerateListOfYearsAndMonths()
  const columns = useMemo(() => tableColumnDef(listOfYearsAndMonths), [listOfYearsAndMonths])

  const state = useMemo(
    () => ({
      columnVisibility,
      sorting: tableQueries.sorting?.length > 0 ? tableQueries.sorting : [{ id: 'employeeRegistry.name', desc: false }],
      pagination: { pageIndex: tableQueries.pageIndex, pageSize: tableQueries.pageSize },
    }),
    [tableQueries, columnVisibility],
  )

  const table = useReactTable({
    columns,
    data: query.data?.rows ?? defaultData,
    rowCount: query.data?.rowCount,
    state,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    initialState: { columnPinning: { left: ['employeeRegistry.name'], right: ['actions'] } },
    onSortingChange,
    onPaginationChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    meta: { emptyState: DataTableEmptyStateWithFrozen },
  })

  const value = useMemo(() => ({ table, query, queryKey }), [queryKey])

  return <EmployeeCommutingContext.Provider value={value}>{children(value)}</EmployeeCommutingContext.Provider>
}
