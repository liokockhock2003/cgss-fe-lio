import { Priority, PriorityValue } from '@/store/authUser.context.ts'

export const isAccessible =
  (userPriority: number = Priority.none) =>
    (accessLevel: PriorityValue = Priority.none) =>
      userPriority <= accessLevel
