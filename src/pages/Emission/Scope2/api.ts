import { QueryFactory } from '@/store/query/queryFactory.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { WithEmissionSymbols } from '@/utilities/common.store.ts'
import { queryOptions } from '@tanstack/react-query'

type Scope2Main = {
  base: {
    id: number
    category: string
    groupByName: string
    groupById: number
    activities: Record<string /* year */, Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12, number>>
    status: 'active' | 'inactive'
    // emissions? for debugging
  } & (
    | { type: 'steam' | 'heat' | 'cooling' }
    | {
        type: 'electric'
        location: 'peninsular' | 'sabah' | 'sarawak'
      }
  )

  response: {
    rowCount: number
    rows: Scope2Main['base'][]
  }
}

const uniqueKey = 'emission-scope-2'

const main = {
  uniqueKey,
  ...QueryFactory<Scope2Main['response']>(uniqueKey),
}

////////////////////////////////////////////////////////////////////////////////////

type Scope2Activity = {
  id: number
  date: string
  input: number
  desc: string
  scope2Id: number
} & WithEmissionSymbols

const activities = {
  ...QueryFactory<Scope2Activity>(`${uniqueKey}-activity`),
  optimize: {
    qk: ({ scope2Id, year, month }: { scope2Id: number; year: number; month: number }) => {
      return [...activities.qk(), 'optimize', { scope2Id, year, month }]
    },
    useQuery(_action?: {
      payload: { scope2Id: number; year: number; month: number }
      onSuccess?: (responseData: Scope2Activity[]) => Promise<Scope2Activity[]>
      onError?: (reason: unknown) => void
    }) {
      const { payload } = _action

      return queryOptions({
        queryKey: activities.optimize.qk(payload),
        queryFn: async () =>
          await axios.get(`${activities.baseUrl}/optimize`, { params: payload }).then<Scope2Activity[]>((i) => i.data),
      })
    },
  },
  softDeleteByYear: () =>
    activities.mutationOption({
      type: 'edit',
      urlManipulation: (url) => {
        const [base, year] = url.split('/')
        return `${base}/soft-delete-by-year/${year}`
      },
      onSuccess: () => {
        // invalidateQuery(main.optimized.qk())
      },
      toastMsg: () => 'Year deleted',
    }),
}

export const Scope2Api = { main, activities }
export type TScope2 = { main: Scope2Main; activities: Scope2Activity }
