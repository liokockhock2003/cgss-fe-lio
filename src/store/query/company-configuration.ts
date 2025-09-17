import { q$ } from '@/store'
import { axios } from '@/utilities/axios-instance.ts'
import { queryOptions } from '@tanstack/react-query'
import { QueryFactory } from './queryFactory.ts'

export type CompanyConfigurationResponse = {
  defaultBaseline: number
  activitiesStartFrom: Date
  optOutCalc: { [key: string]: boolean }
}

const uniqueKey = 'configuration'
export const CompanyConfigurationQuery = {
  uniqueKey,
  ...QueryFactory<CompanyConfigurationResponse>(uniqueKey),
  fetch: () => {
    return queryOptions<CompanyConfigurationResponse>({
      queryKey: [CompanyConfigurationQuery.uniqueKey],
      queryFn: async () => {
        return await axios
          .get('/configuration', {
            params: { filter: { fields: ['defaultBaseline', 'activitiesStartFrom', 'optOutCalc'] } },
          })
          .then((i) => i.data)
      },
    })
  },
  getData: () => q$.queryClient.getQueryData<CompanyConfigurationResponse>([CompanyConfigurationQuery.uniqueKey]),
}
