import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import type { UseQueryResult } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'
import { type TEmissionProduction } from './api.ts'

export const EmissionProductionContext = createContext<
  | {
      table: Table<TEmissionProduction['main']['base']>
      query: UseQueryResult<TEmissionProduction['main']['response']>
      queryKey: readonly [
        key: string,
        'optimize',
        ReturnType<typeof useTableQueries>[0] & { from: Date; to: Date; groupByIds: number[] },
      ]
    }
  | undefined
>(undefined)

export function useEmissionProduction() {
  const context = useContext(EmissionProductionContext)

  if (context === undefined) {
    throw new Error('useEmissionProduction must be used within a EmissionProductionContext')
  }

  return context
}
