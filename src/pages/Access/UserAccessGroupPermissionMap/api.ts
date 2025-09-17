import { QueryFactory } from '@/store/query/queryFactory.ts'

type UserAccessGroupPermissionMap = {
	base: {
		id: number
		accessGroupId: number
		permissionId: number
		userAccessGroup: {
			id: number
			name: string
			description: string
		}
		permission: {
			id: number
			name: string
			description: string
		}
	}

	response: UserAccessGroupPermissionMap['base'][]
}

const uniqueKey = 'user-access-group-permission-map'

const main = {
	uniqueKey,
	...QueryFactory<UserAccessGroupPermissionMap['response']>(uniqueKey),
}

export const UserAccessGroupPermissionMapApi = { main }
export type TUserAccessGroupPermissionMap = { main: UserAccessGroupPermissionMap }
