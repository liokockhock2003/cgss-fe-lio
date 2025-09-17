import { isAccessible } from '@/components/LayoutNewDashbord/isPriorityAccessible.tsx'
import { PageEmissionFactorRoutes } from '@/Router.tsx'
import { ErrorBoundary as ErrorBoundaryComp } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { Card } from '@/components/ui/card'
import { useAuthUser } from '@/store'
import { Priority } from '@/store/authUser.context.ts'
import * as Tabs from '@radix-ui/react-tabs'
import { Suspense } from 'react'
import { createPortal } from 'react-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { ManageEmissionDialog } from './ManageEmissionDialog.tsx'

function EmissionFactorPage() {
  const location = useLocation()
  const { authUser } = useAuthUser()
  const isAllowed = isAccessible(authUser.priority)(Priority.adminSystem)

  const [breadCrumbRightSideEl, setDomReady] = useState(undefined)

  useEffect(() => {
    setDomReady(document.getElementById('breadcrumb-right-side'))
  }, [])

  if (!isAllowed) {
    return <Navigate to='/emission/dashboard' />
  }

  return (
    <>
      <Card className='h-full flex flex-col'>
        <Tabs.Root
          className='flex flex-col overflow-x-auto pb-0.5'
          value={location.pathname.replace('/emission/settings/emission-factor/', '')}>
          <Tabs.List className='shrink-0 flex border-b border-mauve6' aria-label='Manage your account'>
            {PageEmissionFactorRoutes.map((route, i) => (
              <Tabs.Trigger key={i} asChild className='radixUi-tabs__trigger text-nowrap' value={route.path}>
                <Link to={`./${route.path}`}>{(route as { label: string }).label}</Link>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        <ErrorBoundary
          fallback={
            <div className='p-6'>
              <ErrorBoundaryComp />
            </div>
          }>
          <Suspense fallback={<Loading2 />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </Card>

      {breadCrumbRightSideEl && createPortal(<ManageEmissionDialog />, breadCrumbRightSideEl)}
    </>
  )
}

EmissionFactorPage.displayName = 'EmissionFactorPage'
export const Component = EmissionFactorPage
