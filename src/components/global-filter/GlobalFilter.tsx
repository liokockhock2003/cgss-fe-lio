import { CompanyConfigurationQuery } from '@/store/query/company-configuration.ts'
import { useSuspenseQuery } from '@tanstack/react-query'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { FormMultiSelectGroupBy } from './FormMultiSelectGroupBy.tsx'
import { FormSelectGlobalDateRange } from './FormSelectGlobalDateRange.tsx'
import { useGlobalFilterEnable } from './GlobalFilter.context.ts'

export const GlobalFilter = () => {
  const confQuery = useSuspenseQuery(CompanyConfigurationQuery.fetch())

  const isEnable = useGlobalFilterEnable()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (
      confQuery.isSuccess &&
      !(confQuery.data?.defaultBaseline ?? false) &&
      !(confQuery.data?.activitiesStartFrom ?? false)
    ) {
      console.log('No baseline and min activities date yet. Hence redirect >>>>>>>>', confQuery.data)
      navigate('/emission/settings/configuration')
    }
  }, [confQuery.data])

  const enableGlobalDateRange = useMemo(() => {
    const routes = ['scope1', 'scope2', 'scope3', 'dashboard', 'production'].map((i) => `/emission/${i}/*`)
    return routes.find((route) => matchPath(route, pathname))
  }, [pathname])

  return isEnable ?
    <>
      <FormMultiSelectGroupBy />
      {enableGlobalDateRange ?
        <FormSelectGlobalDateRange configuration={confQuery.data} />
        : null}
    </>
    : null
}
