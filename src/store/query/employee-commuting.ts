import { GroupByResponse, RowData } from '@/utilities/ag-grid.helpers.ts'
import { axios } from '@/utilities/axios-instance'
import { WithEmissionSymbols } from '@/utilities/common.store.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { queryOptions } from '@tanstack/react-query'
import { invalidateQuery } from './query-client.ts'
import { QueryFactory } from './queryFactory.ts'

type EmployeeCommutingMain = {
  base: {
    employeeRegistry: { id: number; name: string; staffId: number; status: 'active' | 'inactive' }
    employeeRegistryId: number
  }
  response: GroupByResponse<EmployeeCommutingMain['base']>
  rowData: RowData<EmployeeCommutingMain['base']>
}

const main = {
  ...QueryFactory<EmployeeCommutingMain['response']>('emission-scope3-employee-commuting'), // prettier-ignore,
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

type EmployeeCommutingActivity = {
  id: number
  date: string
  input: number
  desc: string
  employeeCommutingId: number
  metadata: {
    addressFrom: string
    addressTo: string

    distance: number
    EF_MobileCombustionDistanceId: string
  }
} & WithEmissionSymbols

const activities = {
  ...QueryFactory<EmployeeCommutingActivity>('emission-scope3-employee-commuting-activity'),
  optimize: {
    qk: ({ employeeCommutingId, year, month }: { employeeCommutingId: number; year: number; month: number }) => {
      return [...activities.qk(), 'optimize', { employeeCommutingId, year, month }]
    },
    useQuery(_action?: {
      payload: { employeeCommutingId: number; year: number; month: number }
      onSuccess?: (responseData: EmployeeCommutingActivity[]) => Promise<EmployeeCommutingActivity[]>
      onError?: (reason: unknown) => void
    }) {
      const { payload } = _action

      return queryOptions({
        queryKey: activities.optimize.qk(payload),
        queryFn: async () =>
          await axios
            .get(`${activities.baseUrl}/optimize`, { params: payload })
            .then<EmployeeCommutingActivity[]>((i) => i.data),
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

export const employeeCommuting = { main, activities }
export type EmployeeCommuting = { main: EmployeeCommutingMain; activities: EmployeeCommutingActivity }
