import { GroupByResponse, RowData } from '@/utilities/ag-grid.helpers.ts'
import { axios } from '@/utilities/axios-instance'
import { WithEmissionSymbols } from '@/utilities/common.store.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { queryOptions } from '@tanstack/react-query'
import { invalidateQuery } from './query-client.ts'
import { QueryFactory } from './queryFactory.ts'

type Scope2Main = {
  base:
    | { category: string; type: 'steam' | 'heat' | 'cooling' }
    | {
        category: string
        type: 'electric'
        location: 'peninsular' | 'sabah' | 'sarawak'
      }
  response: GroupByResponse<Scope2Main['base']>
  rowData: RowData<Scope2Main['base']>
}

const main = {
  ...QueryFactory<Scope2Main['response']>('emission-scope-2'), // prettier-ignore,
  optimized: {
    qk: () => [...main.qk(), 'optimize'],
    useQuery<T>(_action?: {
      onSuccess: (responseData: GroupByResponse<T>[]) => Promise<RowData<T>[]>
      onError?: (reason: unknown) => void
    }) {
      return queryOptions({
        queryKey: main.optimized.qk(),
        queryFn: async () =>
          await axios
            .get(`${main.baseUrl}/optimize`, { params: isDebug() })
            .then<GroupByResponse<T>[]>((i) => i.data)
            .then<RowData<T>[]>((d) => _action.onSuccess(d)),
      })
    },
  },
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
  ...QueryFactory<Scope2Activity>('emission-scope-2-activity'),
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
        console.log('invalidate', main.optimized.qk())
        invalidateQuery(main.optimized.qk())
      },
      toastMsg: () => 'Year deleted',
    }),
}

export const scope2 = { main, activities }
export type Scope2 = { main: Scope2Main; activities: Scope2Activity }
