import * as v from 'valibot'

// Permission Schema
export const PermissionSchema = v.object({
  id: v.optional(v.number()),
  name: v.pipe(
    v.string(),
    v.nonEmpty('Permission name is required'),
    v.maxLength(100, 'Permission name is too long'),
    v.regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)*\.(create|update|delete|view)$/,
      'Permission name must follow pattern: module.verb or scope.module.verb (verbs: create, update, delete, view)'
    )
  ),
  description: v.optional(v.pipe(
    v.string(),
    v.maxLength(255, 'Description is too long')
  )),
})

export type TPermissionSchema = v.InferInput<typeof PermissionSchema>

// UserGroupByMap Schema
export const UserGroupByMapSchema = v.object({
  id: v.optional(v.number()),
  userId: v.pipe(v.number(), v.integer('User ID must be an integer')),
  groupById: v.pipe(v.number(), v.integer('GroupBy ID must be an integer')),
})

export type TUserGroupByMapSchema = v.InferInput<typeof UserGroupByMapSchema>

// UserAccessGroupMap Schema
export const UserAccessGroupMapSchema = v.object({
  id: v.optional(v.number()),
  userId: v.pipe(v.number(), v.integer('User ID must be an integer')),
  accessGroupId: v.pipe(v.number(), v.integer('Access Group ID must be an integer')),
})

export type TUserAccessGroupMapSchema = v.InferInput<typeof UserAccessGroupMapSchema>

// UserAccessGroupPermissionMap Schema
export const UserAccessGroupPermissionMapSchema = v.object({
  id: v.optional(v.number()),
  accessGroupId: v.pipe(v.number(), v.integer('Access Group ID must be an integer')),
  permissionId: v.pipe(v.number(), v.integer('Permission ID must be an integer')),
})

export type TUserAccessGroupPermissionMapSchema = v.InferInput<typeof UserAccessGroupPermissionMapSchema>

// Search/Filter Schema
export const SearchSchema = v.object({
  query: v.optional(v.string()),
  userId: v.optional(v.number()),
  accessGroupId: v.optional(v.number()),
  permissionId: v.optional(v.number()),
  groupById: v.optional(v.number()),
})

export type TSearchSchema = v.InferInput<typeof SearchSchema>
