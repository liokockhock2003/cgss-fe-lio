import { axios } from '@/utilities/axios-instance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui/use-toast'

// Types for the mapping tables
export interface UserGroupByMap {
	id?: number
	userId: number
	groupById: number
}

export interface UserAccessGroupMap {
	id?: number
	userId?: number
	accessGroupId?: number
}

export interface UserAccessGroupPermissionMap {
	id?: number
	accessGroupId?: number
	permissionId?: number
}

// Query Keys
export const rbacKeys = {
	// UserGroupByMap
	userGroupByMap: ['user-group-by-map'] as const,
	userGroupByMapById: (id: number) => [...rbacKeys.userGroupByMap, id] as const,

	// UserAccessGroupMap
	userAccessGroupMap: ['user-access-group-map'] as const,
	userAccessGroupMapById: (id: number) => [...rbacKeys.userAccessGroupMap, id] as const,

	// UserAccessGroupPermissionMap
	userAccessGroupPermissionMap: ['user-access-group-permission-map'] as const,
	userAccessGroupPermissionMapById: (id: number) => [...rbacKeys.userAccessGroupPermissionMap, id] as const,
}

// UserGroupByMap Queries
export const useUserGroupByMaps = () =>
	useQuery({
		queryKey: rbacKeys.userGroupByMap,
		queryFn: () => axios.get<UserGroupByMap[]>('/user-group-by-map').then(res => res.data),
	})

export const useUserGroupByMap = (id: number) =>
	useQuery({
		queryKey: rbacKeys.userGroupByMapById(id),
		queryFn: () => axios.get<UserGroupByMap>(`/user-group-by-map/${id}`).then(res => res.data),
		enabled: !!id,
	})

export const useCreateUserGroupByMap = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: Omit<UserGroupByMap, 'id'>) =>
			axios.post<UserGroupByMap>('/user-group-by-map', data).then(res => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rbacKeys.userGroupByMap })
			toast({ title: 'User-GroupBy mapping created successfully' })
		},
		onError: () => {
			toast({ title: 'Failed to create User-GroupBy mapping', variant: 'destructive' })
		},
	})
}

export const useUpdateUserGroupByMap = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, ...data }: UserGroupByMap) =>
			axios.patch(`/user-group-by-map/${id}`, data).then(res => res.data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: rbacKeys.userGroupByMap })
			queryClient.invalidateQueries({ queryKey: rbacKeys.userGroupByMapById(variables.id!) })
			toast({ title: 'User-GroupBy mapping updated successfully' })
		},
		onError: () => {
			toast({ title: 'Failed to update User-GroupBy mapping', variant: 'destructive' })
		},
	})
}

export const useDeleteUserGroupByMap = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (id: number) => axios.delete(`/user-group-by-map/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rbacKeys.userGroupByMap })
			toast({ title: 'User-GroupBy mapping deleted successfully' })
		},
		onError: () => {
			toast({ title: 'Failed to delete User-GroupBy mapping', variant: 'destructive' })
		},
	})
}

// UserAccessGroupMap Queries
export const useUserAccessGroupMaps = () =>
	useQuery({
		queryKey: rbacKeys.userAccessGroupMap,
		queryFn: () => axios.get<UserAccessGroupMap[]>('/user-access-group-map').then(res => res.data),
	})

export const useUserAccessGroupMap = (id: number) =>
	useQuery({
		queryKey: rbacKeys.userAccessGroupMapById(id),
		queryFn: () => axios.get<UserAccessGroupMap>(`/user-access-group-map/${id}`).then(res => res.data),
		enabled: !!id,
	})

export const useCreateUserAccessGroupMap = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: Omit<UserAccessGroupMap, 'id'>) =>
			axios.post<UserAccessGroupMap>('/user-access-group-map', data).then(res => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rbacKeys.userAccessGroupMap })
			toast({ title: 'User-AccessGroup mapping created successfully' })
		},
		onError: () => {
			toast({ title: 'Failed to create User-AccessGroup mapping', variant: 'destructive' })
		},
	})
}

export const useUpdateUserAccessGroupMap = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, ...data }: UserAccessGroupMap) =>
			axios.patch(`/user-access-group-map/${id}`, data).then(res => res.data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: rbacKeys.userAccessGroupMap })
			queryClient.invalidateQueries({ queryKey: rbacKeys.userAccessGroupMapById(variables.id!) })
			toast({ title: 'User-AccessGroup mapping updated successfully' })
		},
		onError: () => {
			toast({ title: 'Failed to update User-AccessGroup mapping', variant: 'destructive' })
		},
	})
}

export const useDeleteUserAccessGroupMap = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (id: number) => axios.delete(`/user-access-group-map/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rbacKeys.userAccessGroupMap })
			toast({ title: 'User-AccessGroup mapping deleted successfully' })
		},
		onError: () => {
			toast({ title: 'Failed to delete User-AccessGroup mapping', variant: 'destructive' })
		},
	})
}

// UserAccessGroupPermissionMap Queries
export const useUserAccessGroupPermissionMaps = () =>
	useQuery({
		queryKey: rbacKeys.userAccessGroupPermissionMap,
		queryFn: () => axios.get<UserAccessGroupPermissionMap[]>('/user-access-group-permission-map').then(res => res.data),
	})

export const useUserAccessGroupPermissionMap = (id: number) =>
	useQuery({
		queryKey: rbacKeys.userAccessGroupPermissionMapById(id),
		queryFn: () => axios.get<UserAccessGroupPermissionMap>(`/user-access-group-permission-map/${id}`).then(res => res.data),
		enabled: !!id,
	})

export const useCreateUserAccessGroupPermissionMap = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (data: Omit<UserAccessGroupPermissionMap, 'id'>) =>
			axios.post<UserAccessGroupPermissionMap>('/user-access-group-permission-map', data).then(res => res.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rbacKeys.userAccessGroupPermissionMap })
			toast({ title: 'AccessGroup-Permission mapping created successfully' })
		},
		onError: () => {
			toast({ title: 'Failed to create AccessGroup-Permission mapping', variant: 'destructive' })
		},
	})
}

export const useUpdateUserAccessGroupPermissionMap = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, ...data }: UserAccessGroupPermissionMap) =>
			axios.patch(`/user-access-group-permission-map/${id}`, data).then(res => res.data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: rbacKeys.userAccessGroupPermissionMap })
			queryClient.invalidateQueries({ queryKey: rbacKeys.userAccessGroupPermissionMapById(variables.id!) })
			toast({ title: 'AccessGroup-Permission mapping updated successfully' })
		},
		onError: () => {
			toast({ title: 'Failed to update AccessGroup-Permission mapping', variant: 'destructive' })
		},
	})
}

export const useDeleteUserAccessGroupPermissionMap = () => {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (id: number) => axios.delete(`/user-access-group-permission-map/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rbacKeys.userAccessGroupPermissionMap })
			toast({ title: 'AccessGroup-Permission mapping deleted successfully' })
		},
		onError: () => {
			toast({ title: 'Failed to delete AccessGroup-Permission mapping', variant: 'destructive' })
		},
	})
}
