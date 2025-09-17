import { GlobalFilter } from '@/components/global-filter/GlobalFilter.tsx'
import { TooltipProvider } from '@/components/ui/tooltip.tsx'
import { q$, useAppConfiguration } from '@/store'
import { cn } from '@/utilities/cn.ts'
import { Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Breadcrumbs2 } from '../Breadcrumb.tsx'
import { ThemeToggle } from '../theme-toggle.tsx'
import { MenuSheet } from './menu-sheet.tsx'
import { Sidebar } from './sidebar.tsx'
import { UserNav } from './user-nav.tsx'

export const LayoutNewDashboard = () => {
  const { sidebar } = useAppConfiguration()
  const isEmissionAvailable = q$.General.CompanyInfoQuery.isFeatureAvailable('emission')

  if (!isEmissionAvailable) {
    return <Navigate to='/404' />
  }

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={200}>
      <Sidebar />

      <main
        className={cn(
          'h-full flex flex-col',
          'transition-[margin-left] ease-in-out duration-300 bg-muted/40',
          sidebar ? 'md:ml-72' : 'md:ml-[90px]',
        )}>
        <header className='sticky top-0 z-10 w-full bg-background dark:shadow-secondary'>
          <div className='flex h-16 items-center border-b border-bg-accent px-8'>
            <div className='flex items-center space-x-4 lg:space-x-0'>
              <MenuSheet />
            </div>
            <div className='flex flex-1 items-center space-x-2 justify-end'>
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>

        {/* Suspense here because useSuspenseQuery(CompanyConfigurationQuery.fetch()) */}
        <Suspense>
          <div className='py-4 px-8 flex-1 flex flex-col gap-y-4'>
            <div className='flex items-center flex-wrap gap-y-2 justify-between'>
              <Breadcrumbs2 />
              <div id='breadcrumb-right-side' className='flex gap-x-2 items-center'>
                <GlobalFilter />
              </div>
            </div>

            <Outlet />
          </div>
        </Suspense>
      </main>
    </TooltipProvider>
  )
}
