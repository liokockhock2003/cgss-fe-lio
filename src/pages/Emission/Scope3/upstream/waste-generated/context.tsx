import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import type { UseQueryResult } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext } from 'react'
import { TWasteGenerated } from './api.ts'

export const WasteGeneratedContext = createContext<
  | {
      table: Table<TWasteGenerated['main']['base'][]>
      query: UseQueryResult<TWasteGenerated['main']['response']>
      queryKey: readonly [
        key: string,
        'optimize',
        ReturnType<typeof useTableQueries>[0] & { from: Date; to: Date; groupByIds: number[] },
      ]
    }
  | undefined
>(undefined)

export function useWasteGenerated() {
  const context = useContext(WasteGeneratedContext)

  if (context === undefined) {
    throw new Error('useWasteGenerated must be used within WasteGeneratedContext')
  }

  return context
}
