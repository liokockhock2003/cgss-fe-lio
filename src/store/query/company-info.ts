import { q$ } from '@/store'
import { get } from 'lodash-es'
import { QueryFactory } from './queryFactory.ts'

export type CompanyInfoResponse = {
  id: number
  name: string
  slug: string
  features: ('plant' | 'emission')[]
  expiredAt?: Date
  theme: string
  addresses: string[]
  contactInfo: undefined | { name: string; email: string; contactNo: string } // PIC, name phone number
  metadata: Partial<{
    icon: string
    maxGroups: number
    financialYearStartMonth: undefined | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  }> // this can use to store industry, sub-sector
  status: 'active' | 'inactive'
}

const uniqueKey = 'company-info'
export const CompanyInfoQuery = {
  uniqueKey,
  ...QueryFactory<CompanyInfoResponse>(uniqueKey),
  getBySlugQuery: {
    qk: () => [...CompanyInfoQuery.lists(), 'getBySlugQuery'],
    query: () =>
      CompanyInfoQuery.list<CompanyInfoResponse>({
        queryKey: CompanyInfoQuery.getBySlugQuery.qk(),
        urlManipulation: (_) => `${_}/slug`,
        onSuccess(res) {
          return Promise.resolve({
            ...res,
            metadata: {
              // icon: res.slug === 'demo' ? '' : '/tenant/mycronsteel.png',
              // maxGroups: 2,
              // financialYearStartMonth: 5,
              ...res.metadata,
            },
          })
        },
      })(),
  },
  getData: () => q$.queryClient.getQueryData<CompanyInfoResponse>(CompanyInfoQuery.getBySlugQuery.qk()),
  isFeatureAvailable: (...args: CompanyInfoResponse['features']) => {
    const companyInfo = CompanyInfoQuery.getData()
    if (!companyInfo) {
      return false
    }

    return CompanyInfoQuery.getData().features.some((f) => args.includes(f))
  },
  financialYearStartMonth: (): CompanyInfoResponse['metadata']['financialYearStartMonth'] => {
    return get(CompanyInfoQuery.getData(), 'metadata.financialYearStartMonth', 1)
  },
}
