import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import type { UseQueryResult } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'
import { type TProcessEmission } from './api.ts'

export const ProcessEmissionContext = createContext<
  | {
      table: Table<TProcessEmission['main']['base']>
      query: UseQueryResult<TProcessEmission['main']['response']>
      queryKey: readonly [
        key: string,
        'optimize',
        ReturnType<typeof useTableQueries>[0] & { from: Date; to: Date; groupByIds: number[] },
      ]
    }
  | undefined
>(undefined)

export function useProcessEmission() {
  const context = useContext(ProcessEmissionContext)

  if (context === undefined) {
    throw new Error('useProcessEmission must be used within a ProcessEmissionContext')
  }

  return context
}
