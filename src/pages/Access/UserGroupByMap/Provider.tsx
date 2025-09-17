import { DataTableEmptyStateWithFrozen } from '@/components/tanstack-table/data-table-empty-state-with-frozen.tsx'
import { axios } from '@/utilities/axios-instance.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCoreRowModel, getFacetedRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { tableColumnDef } from './TableColumnDef.tsx'
import { UserGroupByMapApi, type TUserGroupByMap } from './api.ts'
import { UserGroupByMapContext } from './context.tsx'

UserGroupByMapProvider.displayName = 'UserGroupByMap Provider'
export function UserGroupByMapProvider({ children }) {
  const [columnVisibility, onColumnVisibilityChange] = useState({})
  const [sorting, onSortingChange] = useState([{ id: 'id', desc: true }])
  const queryKey = [UserGroupByMapApi.main.uniqueKey] as const

  const query = useQuery({
    placeholderData: keepPreviousData,
    queryKey,
    queryFn: async (): Promise<TUserGroupByMap['main']['response']> => {
      const params = { ...isDebug() }
      return await axios.get(`/${UserGroupByMapApi.main.uniqueKey}`, { params }).then((i) => i.data)
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
    meta: { disablePagination: true, emptyState: DataTableEmptyStateWithFrozen },
  })

  const value = useMemo(() => ({ table, query, queryKey }), [queryKey])

  return <UserGroupByMapContext.Provider value={value}>{children(value)}</UserGroupByMapContext.Provider>
}
