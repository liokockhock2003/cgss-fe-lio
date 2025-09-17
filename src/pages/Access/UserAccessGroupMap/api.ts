import { QueryFactory } from '@/store/query/queryFactory.ts'

type UserAccessGroupMap = {
	base: {
		id: number
		userId: number
		accessGroupId: number
		user: {
			id: number
			name: string
			email: string
		}
		userAccessGroup: {
			id: number
			name: string
			description: string
		}
	}

	response: UserAccessGroupMap['base'][]
}

const uniqueKey = 'user-access-group-map'

const main = {
	uniqueKey,
	...QueryFactory<UserAccessGroupMap['response']>(uniqueKey),
}

export const UserAccessGroupMapApi = { main }
export type TUserAccessGroupMap = { main: UserAccessGroupMap }
