import type { UseQueryResult } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'
import { type TUserGroupByMap } from './api.ts'

export const UserGroupByMapContext = createContext<
  | {
      table: Table<TUserGroupByMap['main']['base']>
      query: UseQueryResult<TUserGroupByMap['main']['response']>
      queryKey: readonly [key: string]
    }
  | undefined
>(undefined)

export function useUserGroupByMap() {
  const context = useContext(UserGroupByMapContext)

  if (context === undefined) {
    throw new Error('useUserGroupByMap must be used within a UserGroupByMapContext')
  }

  return context
}
