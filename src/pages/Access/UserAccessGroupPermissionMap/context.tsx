import type { UseQueryResult } from '@tanstack/react-query'
import type { Table } from '@tanstack/react-table'
import { createContext, useContext } from 'react'
import { type TUserAccessGroupPermissionMap } from './api.ts'

export const UserAccessGroupPermissionMapContext = createContext<
  | {
      table: Table<TUserAccessGroupPermissionMap['main']['base']>
      query: UseQueryResult<TUserAccessGroupPermissionMap['main']['response']>
      queryKey: readonly [key: string]
    }
  | undefined
>(undefined)

export function useUserAccessGroupPermissionMap() {
  const context = useContext(UserAccessGroupPermissionMapContext)

  if (context === undefined) {
    throw new Error('useUserAccessGroupPermissionMap must be used within a UserAccessGroupPermissionMapContext')
  }

  return context
}
