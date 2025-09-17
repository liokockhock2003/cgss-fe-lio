import type { UseQueryResult } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'
import { type TPermission } from './api.ts'

export const PermissionContext = createContext<
  | {
      table: Table<TPermission['main']['base']>
      query: UseQueryResult<TPermission['main']['response']>
      queryKey: readonly [key: string]
    }
  | undefined
>(undefined)

export function usePermission() {
  const context = useContext(PermissionContext)

  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionContext')
  }

  return context
}
