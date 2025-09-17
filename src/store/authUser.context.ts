import { createContext } from 'react'

export const AuthUser = createContext<{
  authUser: IAuthUser
  setAuthUser: (authUser: IAuthUser) => void
  ignorePermission: boolean
}>(undefined)

export interface IAuthUser {
  id: number
  name: string
  username: string
  email: string
  priority?: PriorityValue // lower priority will not be visible
  roles: string[]
  permissions: string[]
  groupByIds: number[]

  // cardId: string
  // staffId: string
  // isDeleted: boolean
  // realm: string
  // emailVerified: boolean
  // userAccessGroups: { name: string; priority: number }[]

  userDetail: UserDetail
}

export interface UserDetail {
  phoneNumber: string
  address1: string
  address2: string
  picture: string
}

export const Priority: { [key: string]: number } = {
  root: 1, // mandatory

  // user defined roles
  adminSystem: 2,
  adminCompany: 3,
  member: 4,
  guest: 5,

  // For internal use
  rank_0: 6,
  owner_0: 7,

  group_0: 8,
  group_1: 9,

  anonymous: 12,
  device: 13,
  external: 14,
  none: 15,
}

export type PriorityValue = (typeof Priority)[keyof typeof Priority]
