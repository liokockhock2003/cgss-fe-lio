import { GroupByResponse, RowData } from '@/utilities/ag-grid.helpers.ts'
import { axios } from '@/utilities/axios-instance'
import { WithEmissionSymbols } from '@/utilities/common.store.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { queryOptions } from '@tanstack/react-query'
import { invalidateQuery } from './query-client.ts'
import { QueryFactory } from './queryFactory.ts'

type MobileCombustionMain = {
  base: {
    mobileRegistryId: number
    mobileRegistry: {
      hasLitreId: boolean
      id: number
      identity_no: string
      EF_MobileCombustionDistanceId: string
      model: string
      status: string
    }
  }
  response: GroupByResponse<MobileCombustionMain['base']>
  rowData: RowData<MobileCombustionMain['base']>
}

const main = {
  ...QueryFactory<MobileCombustionMain['response']>('emission-scope1-mobile-combustion'), // prettier-ignore,
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

type MobileCombustionActivities = {
  id: number
  date: string
  input: number
  desc: string
  type: 'distance' | 'litre'
  mobileCombustion: number // TODO: this should be mobileCombustionId
} & WithEmissionSymbols

const activities = {
  ...QueryFactory<MobileCombustionActivities>('emission-scope1-mobile-combustion-activity'),
  optimize: {
    qk: ({ mobileCombustionId, year, month }: { mobileCombustionId: number; year: number; month: number }) => {
      return [...activities.qk(), 'optimize', { mobileCombustionId, year, month }]
    },
    useQuery(_action?: {
      payload: { mobileCombustionId: number; year: number; month: number }
      onSuccess?: (responseData: MobileCombustionActivities[]) => Promise<MobileCombustionActivities[]>
      onError?: (reason: unknown) => void
    }) {
      const { payload } = _action

      return queryOptions({
        queryKey: activities.optimize.qk(payload),
        queryFn: async () =>
          await axios
            .get(`${activities.baseUrl}/optimize`, { params: payload })
            .then<MobileCombustionActivities[]>((i) => i.data),
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
      onSuccess: () => invalidateQuery(main.optimized.qk()),
      toastMsg: () => 'Year deleted',
    }),
}

export const mobileCombustion = { main, activities }
export type MobileCombustion = { main: MobileCombustionMain; activities: MobileCombustionActivities }
