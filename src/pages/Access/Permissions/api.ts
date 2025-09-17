import { QueryFactory } from '@/store/query/queryFactory.ts'

type Permission = {
	base: {
		id: number
		name: string
		description?: string
	}

	response: Permission['base'][]
}

const uniqueKey = 'permissions'

const main = {
	uniqueKey,
	...QueryFactory<Permission['response']>(uniqueKey),
}

export const PermissionApi = { main }
export type TPermission = { main: Permission }
