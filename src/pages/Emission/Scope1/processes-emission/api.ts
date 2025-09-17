import { QueryFactory } from '@/store/query/queryFactory.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { queryOptions } from '@tanstack/react-query'

type ProcessEmissionMain = {
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
    rows: ProcessEmissionMain['base'][]
  }
}

const uniqueKey = 'emission-scope1-process-emission'

const main = {
  uniqueKey,
  ...QueryFactory<ProcessEmissionMain['response']>(uniqueKey),

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

type ProcessEmissionActivity = {
  id: number
  date: string
  input: number
  desc: string
  processEmissionId: number
}

const activities = {
  ...QueryFactory<ProcessEmissionActivity>(`${uniqueKey}-activity`),
  optimize: {
    qk: ({ processEmissionId, year, month }: { processEmissionId: number; year: number; month: number }) => {
      return [...activities.qk(), 'optimize', { processEmissionId, year, month }]
    },
    useQuery(_action?: {
      payload: { processEmissionId: number; year: number; month: number }
      onSuccess?: (responseData: ProcessEmissionActivity[]) => Promise<ProcessEmissionActivity[]>
      onError?: (reason: unknown) => void
    }) {
      const { payload } = _action

      return queryOptions({
        queryKey: activities.optimize.qk(payload),
        queryFn: async () =>
          await axios
            .get(`${activities.baseUrl}/optimize`, { params: payload })
            .then<ProcessEmissionActivity[]>((i) => i.data),
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

export const ProcessEmissionApi = { main, activities }
export type TProcessEmission = { main: ProcessEmissionMain; activities: ProcessEmissionActivity }
