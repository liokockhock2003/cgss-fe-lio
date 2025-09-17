import { useAuthUser } from '@/store'
import { Priority } from '@/store/authUser.context.ts'

export function useCan({
  permission,
  groupById
}: {
  permission: string,
  groupById?: number
}): boolean {
  const { authUser, ignorePermission } = useAuthUser()
  if (!authUser) return false

  if (ignorePermission) return true

  if (authUser.priority && authUser.priority <= Priority.adminCompany) return true

  if (permission.endsWith('.view')) return true

  const isOwnGroup = groupById ? authUser.groupByIds.includes(groupById) : false
  const isAllowed =  authUser.permissions?.includes(permission) ?? false

  if (groupById) return isOwnGroup && isAllowed

  return isAllowed
}
