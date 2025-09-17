import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import { UseQueryResult } from '@tanstack/react-query'
import { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'
import { TUdtd } from './api.ts'

export const UdtdContext = createContext<
  | {
      table: Table<TUdtd['base']>
      query: UseQueryResult<TUdtd['response']>
      queryKey: readonly [
        key: string,
        'optimize',
        ReturnType<typeof useTableQueries>[0] & {
          from: Date
          to: Date
          groupByIds: number[]
        } & { type: 'upstream' | 'downstream' },
      ]
    }
  | undefined
>(undefined)

export function useUdtd() {
  const context = useContext(UdtdContext)

  if (context === undefined) {
    throw new Error('useUdtd must be used within a UdtdContext')
  }

  return context
}
