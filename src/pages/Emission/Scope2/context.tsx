import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import type { UseQueryResult } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'
import { type TScope2 } from './api.ts'

export const Scope2Context = createContext<
  | {
      table: Table<TScope2['main']['base']>
      query: UseQueryResult<TScope2['main']['response']>
      queryKey: readonly [
        key: string,
        'optimize',
        ReturnType<typeof useTableQueries>[0] & { from: Date; to: Date; groupByIds: number[] },
      ]
    }
  | undefined
>(undefined)

export function useScope2() {
  const context = useContext(Scope2Context)

  if (context === undefined) {
    throw new Error('useScope2 must be used within a Scope2Context')
  }

  return context
}
