import type { UseQueryResult } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'
import { type TUserAccessGroupMap } from './api.ts'

export const UserAccessGroupMapContext = createContext<
  | {
      table: Table<TUserAccessGroupMap['main']['base']>
      query: UseQueryResult<TUserAccessGroupMap['main']['response']>
      queryKey: readonly [key: string]
    }
  | undefined
>(undefined)

export function useUserAccessGroupMap() {
  const context = useContext(UserAccessGroupMapContext)

  if (context === undefined) {
    throw new Error('useUserAccessGroupMap must be used within a UserAccessGroupMapContext')
  }

  return context
}
