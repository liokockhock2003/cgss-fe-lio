import { QueryFactory } from '@/store/query/queryFactory.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { queryOptions } from '@tanstack/react-query'

type EmissionProductionMain = {
  base: {
    id: number
    category: string
    groupByName: string
    groupById: number
    activities: Record<string /* year */, Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12, number>>
    status: 'active' | 'inactive'
    // emissions? for debugging
  }
  response: {
    rowCount: number
    rows: EmissionProductionMain['base'][]
  }
}

const uniqueKey = 'emission-production'

const main = {
  uniqueKey,
  ...QueryFactory<EmissionProductionMain['response']>(uniqueKey),

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

type EmissionProductionActivity = {
  id: number
  date: string
  input: number
  desc: string
  emissionProductionId: number
}

const activities = {
  ...QueryFactory<EmissionProductionActivity>(`${uniqueKey}-activity`),
  optimize: {
    qk: ({ emissionProductionId, year, month }: { emissionProductionId: number; year: number; month: number }) => {
      return [...activities.qk(), 'optimize', { emissionProductionId, year, month }]
    },
    useQuery(_action?: {
      payload: { emissionProductionId: number; year: number; month: number }
      onSuccess?: (responseData: EmissionProductionActivity[]) => Promise<EmissionProductionActivity[]>
      onError?: (reason: unknown) => void
    }) {
      const { payload } = _action

      return queryOptions({
        queryKey: activities.optimize.qk(payload),
        queryFn: async () =>
          await axios
            .get(`${activities.baseUrl}/optimize`, { params: payload })
            .then<EmissionProductionActivity[]>((i) => i.data),
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

export const EmissionProductionApi = { main, activities }
export type TEmissionProduction = { main: EmissionProductionMain; activities: EmissionProductionActivity }
