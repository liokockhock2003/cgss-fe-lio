import { q$ } from '@/store/query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'

export function CompanyInfo(props: PropsWithChildren) {
  const query = useSuspenseQuery(q$.General.CompanyInfoQuery.getBySlugQuery.query())

  useEffect(() => {
    if (!query.data) {
      throw Error('Company may have expired or not active')
    }

    const theme = query.data.theme
    // const theme = 'violet'
    document.documentElement.className = 'theme-' + (theme || 'blue')
  }, [query.data])

  return props.children
}
