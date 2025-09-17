import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { QueryFactory } from './queryFactory.ts'

export type EmployeeRegistryResponse = {
  id: number
  name: string
  staffId: string
  addressFrom: string
  addressTo: string
  distance: number
  avg_day_working_per_month: number
  status: 'active' | 'inactive'
  EF_MobileCombustionDistanceId: string
}

const uniqueKey = 'employee-registry'
export const EmployeeRegistryQuery = {
  uniqueKey,
  ...QueryFactory<EmployeeRegistryResponse>(uniqueKey),
  useDropdownQuery: (lb4Filter = undefined) =>
    useQuery(
      EmployeeRegistryQuery.list<EmployeeRegistryResponse[]>()(
        lb4Filter ?? {
          params: {
            filter: {
              fields: [
                'id',
                'name',
                'distance',
                'addressFrom',
                'staffId',
                'avg_day_working_per_month',
                'EF_MobileCombustionDistanceId',
              ],
              where: { status: 'active' },
            },
          },
        },
      ),
    ),
  // refactor later
  useEmployeeById: (id: number) =>
    useSuspenseQuery(
      EmployeeRegistryQuery.detail<EmployeeRegistryResponse>(id)({
        params: {
          filter: {
            fields: [
              'id',
              'name',
              'distance',
              'addressFrom',
              'avg_day_working_per_month',
              'EF_MobileCombustionDistanceId',
            ],
          },
        },
      }),
    ),
}
