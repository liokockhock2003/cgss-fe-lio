import { QueryFactory } from '@/store/query/queryFactory.ts'
import { MonthlyActivities } from '@/utilities/ag-grid.helpers.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { WithEmissionSymbols } from '@/utilities/common.store.ts'
import { queryOptions } from '@tanstack/react-query'

type MobileCombustionMain = {
  base: {
    id: number
    groupByName: string
    groupById: number
    mobileRegistryId: number
    mobileRegistry: {
      hasLitreId: boolean
      id: number
      identity_no: string
      EF_MobileCombustionDistanceId: string
      model: string
      status: string
    }
    activities: MonthlyActivities
    status: 'active' | 'inactive'
    // emissions? for debugging
  }
  response: {
    rowCount: number
    rows: MobileCombustionMain['base'][]
  }
}

const uniqueKey = 'emission-scope1-mobile-combustion'

const main = {
  uniqueKey,
  ...QueryFactory<MobileCombustionMain['response']>(uniqueKey),

  // /** @deprecated seems like not using atm */
  // optimized: {
  //   qk: () => [...main.qk(), 'optimize'],
  //   useQuery<T>(_action?: {
  //     onSuccess: (responseData: GroupByResponse<T>[]) => Promise<RowData<T>[]>
  //     onError?: (reason: unknown) => void
  //   }) {
  //     return queryOptions({
  //       queryKey: main.optimized.qk(),
  //       queryFn: async () =>
  //         await axios
  //           .get(`${main.baseUrl}/optimize`, { params: isDebug() })
  //           .then<GroupByResponse<T>[]>((i) => i.data)
  //           .then<RowData<T>[]>((d) => _action.onSuccess(d)),
  //     })
  //   },
  // },
}

////////////////////////////////////////////////////////////////////////////////////

type MobileCombustionActivity = {
  id: number
  date: string
  input: number
  desc: string
  type: 'distance' | 'litre'
  mobileCombustion: number // TODO: this should be mobileCombustionId
} & WithEmissionSymbols

const activities = {
  ...QueryFactory<MobileCombustionActivity>('emission-scope1-mobile-combustion-activity'),
  optimize: {
    qk: ({ mobileCombustionId, year, month }: { mobileCombustionId: number; year: number; month: number }) => {
      return [...activities.qk(), 'optimize', { mobileCombustionId, year, month }]
    },
    useQuery(_action?: {
      payload: { mobileCombustionId: number; year: number; month: number }
      onSuccess?: (responseData: MobileCombustionActivity[]) => Promise<MobileCombustionActivity[]>
      onError?: (reason: unknown) => void
    }) {
      const { payload } = _action

      return queryOptions({
        queryKey: activities.optimize.qk(payload),
        queryFn: async () =>
          await axios
            .get(`${activities.baseUrl}/optimize`, { params: payload })
            .then<MobileCombustionActivity[]>((i) => i.data),
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
      // onSuccess: () => invalidateQuery(main.optimized.qk()),
      toastMsg: () => 'Year deleted',
    }),
}

export const MobileCombustionApi = { main, activities }
export type TMobileCombustion = { main: MobileCombustionMain; activities: MobileCombustionActivity }
