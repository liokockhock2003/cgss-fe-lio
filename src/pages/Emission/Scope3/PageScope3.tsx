import { PageScope3DownstreamRoutes, PageScope3UpstreamRoutes } from '@/Router.tsx'
import { useGlobalFilterSerializer } from '@/components/global-filter/GlobalFilter.context.ts'
import { Card } from '@/components/ui/card.tsx'
import * as Tabs from '@radix-ui/react-tabs'
import { Link, Outlet, useLocation } from 'react-router-dom'

function PageScope3() {
  const location = useLocation()
  const globalFilterParams = useGlobalFilterSerializer()

  const scope3Type = useMemo(() => {
    return location.pathname.includes('downstream') ? 'downstream' : 'upstream'
  }, [location.pathname])

  const routeObject = useMemo(() => {
    return {
      downstream: PageScope3DownstreamRoutes,
      upstream: PageScope3UpstreamRoutes,
      // @ts-ignore
    }[scope3Type].filter((i) => !i?.disabled)
  }, [scope3Type])

  return (
    <Card className='h-full flex flex-col'>
      <Tabs.Root
        className='flex flex-col overflow-x-auto pb-0.5'
        value={location.pathname.replace(`/emission/scope3/${scope3Type}/`, '')}>
        <Tabs.List className='shrink-0 flex border-b border-mauve6' aria-label='Emission Scope 3'>
          {routeObject.map((route, i) => (
            <Tabs.Trigger key={i} asChild className='radixUi-tabs__trigger text-nowrap' value={route.path}>
              <Link to={`./${scope3Type}/${route.path}${globalFilterParams}`}>{route.handle.crumb()}</Link>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      <Outlet />
    </Card>
  )
}

PageScope3.displayName = 'PageScope3'
export const Component = PageScope3
