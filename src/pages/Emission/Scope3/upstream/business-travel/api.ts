import { QueryFactory } from '@/store/query/queryFactory.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { queryOptions } from '@tanstack/react-query'

export type TBusinessTravelMain = {
  base: {
    id: number
    purpose: string
    desc: string
    date: string
    co2e: number
    travelers: string[]
    groupById: number
    groupByName: string
  }
  response: {
    rowCount: number
    rows: TBusinessTravelMain['base'][]
  }
  detail: {
    travelers: {
      id: number
      employeeRegistryId: number
      businessTravelId: number
      logs: {
        addressFrom: string
        addressTo: string
        type: 'distance' | 'litre'
        input: number
        EF_MobileCombustionDistanceId: string
      }[]
    }[]
  } & Omit<TBusinessTravelMain['base'], 'co2e' | 'travelers' | 'groupBy'>
}

const uniqueKey = 'emission-scope3-business-travel'

const main = {
  uniqueKey,
  ...QueryFactory<TBusinessTravelMain['response']>(uniqueKey),
  optimized: {
    qk: (pagination: { pageSize: number; pageIndex: number } = undefined) =>
      [...main.qk(), 'optimize', pagination].filter(Boolean),
    useQuery: <T = TBusinessTravelMain['response']>(_action?: {
      pagination: Parameters<typeof main.optimized.qk>
      onSuccess: (responseData: T) => Promise<T>
      onError?: (reason: unknown) => void
    }) => {
      return queryOptions<T>({
        queryKey: main.optimized.qk(_action.pagination),
        queryFn: async () =>
          await axios
            .get(`${main.baseUrl}/optimize`, { params: isDebug() })
            .then((i) => i.data)
            .then((d) => _action.onSuccess(d)),
      })
    },
  },
}

export const BusinessTravelApi = { main } as const
