import { transform } from '@/pages/Emission/Summary/TableColumnDef.tsx'
import type { UseQueryResult } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'
import { type TEmissionSummary } from './api.ts'

export const EmissionSummaryContext = createContext<
  | {
      table: Table<TEmissionSummary['response']>
      query: UseQueryResult<ReturnType<typeof transform>>
      queryKey: readonly [string, { groupByIds: number[]; isFY: boolean }]
    }
  | undefined
>(undefined)

export function useEmissionSummary() {
  const context = useContext(EmissionSummaryContext)

  if (context === undefined) {
    throw new Error('useEmissionSummary must be used within a EmissionSummaryContext')
  }

  return context
}
