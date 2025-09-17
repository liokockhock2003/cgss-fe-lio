import { PageScope1Routes } from '@/Router.tsx'
import { useGlobalFilterSerializer } from '@/components/global-filter/GlobalFilter.context.ts'
import { Card } from '@/components/ui/card'
import * as Tabs from '@radix-ui/react-tabs'
import { Link, Outlet, useLocation } from 'react-router-dom'

function PageScope1() {
  const location = useLocation()
  const globalFilterParams = useGlobalFilterSerializer()

  return (
    <Card className='h-full flex flex-col'>
      <Tabs.Root
        className='flex flex-col overflow-x-auto pb-0.5'
        value={location.pathname.replace('/emission/scope1/', '')}>
        <Tabs.List className='shrink-0 flex border-b border-mauve6' aria-label='Emission Scope 1'>
          {PageScope1Routes.map((route, i) => (
            <Tabs.Trigger key={i} asChild className='radixUi-tabs__trigger text-nowrap' value={route.path}>
              <Link to={`./${route.path}${globalFilterParams}`}>{route.handle.crumb()}</Link>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      <Outlet />
    </Card>
  )
}

PageScope1.displayName = 'PageScope1'
export const Component = PageScope1
