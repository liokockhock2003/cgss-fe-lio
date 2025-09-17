import { QueryFactory } from '@/store/query/queryFactory.ts'

type UserGroupByMap = {
	base: {
		id: number
		userId: number
		groupById: number
		user: {
			id: number
			name: string
			email: string
		}
		groupBy: {
			id: number
			name: string
		}
	}

	response: UserGroupByMap['base'][]
}

const uniqueKey = 'user-group-by-map'

const main = {
	uniqueKey,
	...QueryFactory<UserGroupByMap['response']>(uniqueKey),
}

export const UserGroupByMapApi = { main }
export type TUserGroupByMap = { main: UserGroupByMap }
