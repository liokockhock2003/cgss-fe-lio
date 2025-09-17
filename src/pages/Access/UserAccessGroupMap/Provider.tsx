import { DataTableEmptyStateWithFrozen } from '@/components/tanstack-table/data-table-empty-state-with-frozen.tsx'
import { axios } from '@/utilities/axios-instance.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFacetedRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { tableColumnDef } from './TableColumnDef.tsx'
import { UserAccessGroupMapApi, type TUserAccessGroupMap } from './api.ts'
import { UserAccessGroupMapContext } from './context.tsx'

UserAccessGroupMapProvider.displayName = 'UserAccessGroupMap Provider'
export function UserAccessGroupMapProvider({ children }) {
  const [columnVisibility, onColumnVisibilityChange] = useState({})
  const [sorting, onSortingChange] = useState([{ id: 'id', desc: true }])
  const queryKey = [UserAccessGroupMapApi.main.uniqueKey] as const

  const query = useQuery({
    placeholderData: keepPreviousData,
    queryKey,
    queryFn: async (): Promise<TUserAccessGroupMap['main']['response']> => {
      const params = { ...isDebug() }
      return await axios.get(`/${UserAccessGroupMapApi.main.uniqueKey}`, { params }).then((i) => i.data)
    },
  })

  const defaultData = useMemo(() => [], [])
  const columns = useMemo(() => tableColumnDef(), [])

  const state = useMemo(
    () => ({
      columnVisibility,
      sorting,
    }),
    [sorting, columnVisibility],
  )

  const table = useReactTable({
    columns,
    data: query.data ?? defaultData,
    state,
    manualSorting: true,
    manualFiltering: true,
    initialState: {
      columnPinning: { left: ['id'], right: ['actions'] },
      pagination: { pageSize: 1000 } // Show all data
    },
    onSortingChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    meta: {disablePagination: true,  emptyState: DataTableEmptyStateWithFrozen },
  })

  const value = useMemo(() => ({ table, query, queryKey }), [queryKey])

  return <UserAccessGroupMapContext.Provider value={value}>{children(value)}</UserAccessGroupMapContext.Provider>
}
