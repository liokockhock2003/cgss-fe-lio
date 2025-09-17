import { QueryFactory } from '@/store/query/queryFactory.ts'
import { GroupByResponse, RowData } from '@/utilities/ag-grid.helpers.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { queryOptions } from '@tanstack/react-query'

export type TUdtd = {
  base: {
    id: number
    name: string
    desc: string
    date: string
    type: 'upstream' | 'downstream'
    co2e: number
    groupById: number
    groupByName: string
    metadata: {
      addressFrom: string
      addressTo: string

      distance: number
      EF_MobileCombustionDistanceId: string

      displayAs: string
    }
  }
  response: {
    rowCount: number
    rows: TUdtd['base'][]
  }
}

const uniqueKey = 'emission-scope3-upstream-downstream-transportation-and-distribution'

const main = {
  uniqueKey,
  ...QueryFactory<TUdtd['response']>(uniqueKey), // prettier-ignore,
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

export const UdtdApi = { main }
