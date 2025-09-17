import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import type { UseQueryResult } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'
import { type TStationaryCombustion } from './api.ts'

export const StationaryCombustionContext = createContext<
  | {
      table: Table<TStationaryCombustion['main']['base']>
      query: UseQueryResult<TStationaryCombustion['main']['response']>
      queryKey: readonly [
        key: string,
        'optimize',
        ReturnType<typeof useTableQueries>[0] & { from: Date; to: Date; groupByIds: number[] },
      ]
    }
  | undefined
>(undefined)

export function useStationaryCombustion() {
  const context = useContext(StationaryCombustionContext)

  if (context === undefined) {
    throw new Error('useStationaryCombustion must be used within a StationaryCombustionContext')
  }

  return context
}
