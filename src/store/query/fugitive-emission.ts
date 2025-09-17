import { GroupByResponse, RowData } from '@/utilities/ag-grid.helpers.ts'
import { axios } from '@/utilities/axios-instance'
import { isDebug } from '@/utilities/useDebug.ts'
import { queryOptions } from '@tanstack/react-query'
import { invalidateQuery } from './query-client.ts'
import { QueryFactory } from './queryFactory.ts'

type FugitiveEmissionMain = {
  base: {
    typeId: string
    type: { state: string; unit: string; fuel_types: string; name: string; id: string }
    status: 'active' | 'inactive'
  }
  response: GroupByResponse<FugitiveEmissionMain['base']>
  rowData: RowData<FugitiveEmissionMain['base']>
}

const main = {
  ...QueryFactory<FugitiveEmissionMain['response']>('emission-scope1-fugitive-emission'), // prettier-ignore,
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

type FugitiveEmissionActivity = {
  id: number
  date: string
  input: number
  desc: string
  fugitiveEmissionId: number
}

const activities = {
  ...QueryFactory<FugitiveEmissionActivity>('emission-scope1-fugitive-emission-activity'),
  optimize: {
    qk: ({ fugitiveEmissionId, year, month }: { fugitiveEmissionId: number; year: number; month: number }) => {
      return [...activities.qk(), 'optimize', { fugitiveEmissionId, year, month }]
    },
    useQuery(_action?: {
      payload: { fugitiveEmissionId: number; year: number; month: number }
      onSuccess?: (responseData: FugitiveEmissionActivity[]) => Promise<FugitiveEmissionActivity[]>
      onError?: (reason: unknown) => void
    }) {
      const { payload } = _action

      return queryOptions({
        queryKey: activities.optimize.qk(payload),
        queryFn: async () =>
          await axios
            .get(`${activities.baseUrl}/optimize`, { params: payload })
            .then<FugitiveEmissionActivity[]>((i) => i.data),
      })
    },
  },
  softDelete: () =>
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

export const fugitiveEmission = { main, activities }
export type FugitiveEmission = { main: FugitiveEmissionMain; activities: FugitiveEmissionActivity }
