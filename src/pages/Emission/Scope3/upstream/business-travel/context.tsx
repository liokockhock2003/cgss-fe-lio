import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import { type UseQueryResult } from '@tanstack/react-query'
import { type Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'
import { TBusinessTravelMain } from './api.ts'

export const BusinessTravelContext = createContext<
  | {
      table: Table<TBusinessTravelMain['base']>
      query: UseQueryResult<TBusinessTravelMain['response']>
      queryKey: readonly [
        key: string,
        'optimize',
        ReturnType<typeof useTableQueries>[0] & { from: Date; to: Date; groupByIds: number[] },
      ]
    }
  | undefined
>(undefined)

export function useBusinessTravel() {
  const context = useContext(BusinessTravelContext)

  if (context === undefined) {
    throw new Error('useBusinessTravel must be used within a BusinessTravelContext')
  }

  return context
}
