import { QueryFactory } from '@/store/query/queryFactory.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { WithEmissionSymbols } from '@/utilities/common.store.ts'
import { queryOptions } from '@tanstack/react-query'

type StationaryCombustionMain = {
  base: {
    id: number
    groupByName: string
    groupById: number
    typeId: string
    type: { state: 'solid' | 'liquid' | 'gas'; unit: string; fuel_types: string; name: string; id: string }
    activities: Record<string /* year */, Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12, number>>
    status: 'active' | 'inactive'
    // emissions? for debugging
  }
  response: {
    rowCount: number
    rows: StationaryCombustionMain['base'][]
  }
}

const uniqueKey = 'emission-scope1-stationary-combustion'

const main = {
  uniqueKey,
  ...QueryFactory<StationaryCombustionMain['response']>(uniqueKey),

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

type StationaryCombustionActivity = {
  id: number
  date: string
  input: number
  desc: string
  stationaryCombustionId: number
} & WithEmissionSymbols

const activities = {
  ...QueryFactory<StationaryCombustionActivity>(`${uniqueKey}-activity`),
  optimize: {
    qk: ({ stationaryCombustionId, year, month }: { stationaryCombustionId: number; year: number; month: number }) => {
      return [...activities.qk(), 'optimize', { stationaryCombustionId, year, month }]
    },
    useQuery(_action?: {
      payload: { stationaryCombustionId: number; year: number; month: number }
      onSuccess?: (responseData: StationaryCombustionActivity[]) => Promise<StationaryCombustionActivity[]>
      onError?: (reason: unknown) => void
    }) {
      const { payload } = _action

      return queryOptions({
        queryKey: activities.optimize.qk(payload),
        queryFn: async () =>
          await axios
            .get(`${activities.baseUrl}/optimize`, { params: payload })
            .then<StationaryCombustionActivity[]>((i) => i.data),
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

export const StationaryCombustionApi = { main, activities }
export type TStationaryCombustion = { main: StationaryCombustionMain; activities: StationaryCombustionActivity }
