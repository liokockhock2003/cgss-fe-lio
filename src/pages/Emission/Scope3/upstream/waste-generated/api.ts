import { EmissionFactorDropdown } from '@/store/query/emission-factor.ts'
import { invalidateQuery } from '@/store/query/query-client.ts'
import { QueryFactory } from '@/store/query/queryFactory.ts'
import { GroupByResponse, RowData } from '@/utilities/ag-grid.helpers.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { queryOptions } from '@tanstack/react-query'

type WasteGeneratedMain = {
  base: {
    id: number
    category: string
    status: 'active' | 'inactive'
    activities: Record<string /* year */, Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12, number>>
    groupBy: { name: string; id: number }
    groupById: number
  } & (
    | {
        type: 'waste_type_specific_method'
        materialId: string
        materialIdHuman: string
        method: EmissionFactorDropdown['waste_generated'][number]['methods'][number]['id']
        methodHuman: string
      }
    | {
        type: 'supplier_specific_method'
        materialId: string
        materialIdHuman: string
        method: ''
        methodHuman: ''
      }
  )
  response: {
    rowCount: number
    rows: WasteGeneratedMain['base'][]
  }
}

const uniqueKey = 'emission-scope-3-waste-generated'

const main = {
  uniqueKey,
  ...QueryFactory<WasteGeneratedMain['response']>(uniqueKey),
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
  wasteGeneratedId: number
  CO2E: number
}

const activities = {
  ...QueryFactory<EmployeeCommutingActivity>(`${uniqueKey}-activity`),
  optimize: {
    qk: ({ wasteGeneratedId, year, month }: { wasteGeneratedId: number; year: number; month: number }) => {
      return [...activities.qk(), 'optimize', { wasteGeneratedId, year, month }]
    },
    useQuery(_action?: {
      payload: { wasteGeneratedId: number; year: number; month: number }
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

export const WasteGeneratedApi = { main, activities }
export type TWasteGenerated = { main: WasteGeneratedMain; activities: EmployeeCommutingActivity }
