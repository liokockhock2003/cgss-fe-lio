import { GroupByResponse, RowData } from '@/utilities/ag-grid.helpers.ts'
import { axios } from '@/utilities/axios-instance'
import { WithEmissionSymbols } from '@/utilities/common.store.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { queryOptions } from '@tanstack/react-query'
import { invalidateQuery } from './query-client.ts'
import { QueryFactory } from './queryFactory.ts'

type StationaryCombustionMain = {
  base: {
    typeId: string
    type: { state: 'solid' | 'liquid' | 'gas'; unit: string; fuel_types: string; name: string; id: string }
  }
  response: GroupByResponse<StationaryCombustionMain['base']>
  rowData: RowData<StationaryCombustionMain['base']>
}

const main = {
  ...QueryFactory<StationaryCombustionMain['response']>('emission-scope1-stationary-combustion'), // prettier-ignore,
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

type StationaryCombustionActivity = {
  id: number
  date: string
  input: number
  desc: string
  stationaryCombustionId: number
} & WithEmissionSymbols

const activities = {
  ...QueryFactory<StationaryCombustionActivity>('emission-scope1-stationary-combustion-activity'),
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
      onSuccess: () => invalidateQuery(main.optimized.qk()),
      toastMsg: () => 'Year deleted',
    }),
}

export const stationaryCombustion = { main, activities }
export type StationaryCombustion = { main: StationaryCombustionMain; activities: StationaryCombustionActivity }
