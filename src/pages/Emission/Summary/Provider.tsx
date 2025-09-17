import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFacetedRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import { transform } from './TableColumnDef.tsx'
import { EmissionSummaryApi } from './api.ts'
import { EmissionSummaryContext } from './context.tsx'

EmissionSummaryProvider.displayName = 'EmissionSummary Provider'
export function EmissionSummaryProvider({ children }) {
  const [{ groupByIds, isFY }] = useGlobalFilter()
  const queryKey = [EmissionSummaryApi.main.uniqueKey, { groupByIds, isFY }] as const

  const query = useQuery({
    placeholderData: keepPreviousData,
    queryKey,
    queryFn: async (): Promise<ReturnType<typeof transform>> => {
      const params = queryKey.at(-1)
      return await axios
        .get(`dashboard/${EmissionSummaryApi.main.uniqueKey}`, { params, ...isDebug() })
        .then((i) => i.data)
        .then(transform)
        .catch((err) => {
          console.error(err)
          throw err
        })
    },
  })

  const defaultData = useMemo(() => [], [])

  const table = useReactTable({
    columns: query.data?.colDef ?? defaultData,
    data: query.data?.rows ?? defaultData,
    initialState: { columnPinning: { left: ['label'] } },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    meta: { disablePagination: true },
  })

  const value = useMemo(() => ({ table, query, queryKey }), [queryKey])

  return <EmissionSummaryContext.Provider value={value}>{children(value)}</EmissionSummaryContext.Provider>
}
