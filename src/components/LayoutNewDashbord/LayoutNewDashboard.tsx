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
          'h-screen flex flex-col', // Changed to h-screen
          'transition-[margin-left] ease-in-out duration-300 bg-muted/40',
          sidebar ? 'md:ml-72' : 'md:ml-[90px]',
        )}>
        <header className='sticky top-0 z-10 flex-shrink-0 w-full bg-background dark:shadow-secondary'>
          <div className='flex items-center h-16 px-8 border-b border-bg-accent'>
            <div className='flex items-center space-x-4 lg:space-x-0'>
              <MenuSheet />
            </div>
            <div className='flex items-center justify-end flex-1 space-x-2'>
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>

        <Suspense>
          <div className='flex flex-col flex-1 min-h-0 px-8 py-4 overflow-hidden gap-y-4'>
            <div className='flex flex-wrap items-center justify-between flex-shrink-0 gap-y-2'>
              <Breadcrumbs2 />
              <div id='breadcrumb-right-side' className='flex items-center gap-x-2'>
                <GlobalFilter />
              </div>
            </div>

            <div className='flex-1 min-h-0 overflow-hidden'>
              <Outlet />
            </div>
          </div>
        </Suspense>
      </main>
    </TooltipProvider>
  )
}
