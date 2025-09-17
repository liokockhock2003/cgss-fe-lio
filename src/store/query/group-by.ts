import { useQuery } from '@tanstack/react-query'
import { QueryFactory } from './queryFactory.ts'

export type GroupByResponse = {
  id: number
  name: string
  status: 'active' | 'inactive'
}

const uniqueKey = 'group-by'
export const GroupByQuery = {
  uniqueKey,
  ...QueryFactory<GroupByResponse>(uniqueKey),
  useDropdownQuery: () =>
    useQuery(
      GroupByQuery.list<GroupByResponse[]>()({
        params: { filter: { fields: ['name', 'id', 'status'] } },
      }),
    ),
}
