import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import type { UseQueryResult } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext } from 'react'
import { TEmployeeCommuting } from './api.ts'

export const EmployeeCommutingContext = createContext<
  | {
      table: Table<TEmployeeCommuting['main']['base'][]>
      query: UseQueryResult<TEmployeeCommuting['main']['response']>
      queryKey: readonly [
        key: string,
        'optimize',
        ReturnType<typeof useTableQueries>[0] & { from: Date; to: Date; groupByIds: number[] },
      ]
    }
  | undefined
>(undefined)

export function useEmployeeCommuting() {
  const context = useContext(EmployeeCommutingContext)

  if (context === undefined) {
    throw new Error('usTEmployeeCommuting must be used within aTEmployeeCommutingContext')
  }

  return context
}
