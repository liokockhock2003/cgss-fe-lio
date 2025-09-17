import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import type { UseQueryResult } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'
import { type TMobileCombustion } from './api.ts'

export const MobileCombustionContext = createContext<
  | {
      table: Table<TMobileCombustion['main']['base']>
      query: UseQueryResult<TMobileCombustion['main']['response']>
      queryKey: readonly [
        key: string,
        'optimize',
        ReturnType<typeof useTableQueries>[0] & { from: Date; to: Date; groupByIds: number[] },
      ]
    }
  | undefined
>(undefined)

export function useMobileCombustion() {
  const context = useContext(MobileCombustionContext)

  if (context === undefined) {
    throw new Error('useMobileCombustion must be used within a MobileCombustionContext')
  }

  return context
}
