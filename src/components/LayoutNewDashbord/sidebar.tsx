import { Button } from '@/components/ui/button.tsx'
import { q$, useAppConfiguration } from '@/store'
import { cn } from '@/utilities/cn.ts'
import { ChevronLeft, PanelsTopLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Menu } from './menu.tsx'

export function Sidebar() {
  const { sidebar, toggleSidebar } = useAppConfiguration()
  const companyInfo = q$.General.CompanyInfoQuery.getData()

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-20 h-screen -translate-x-full md:translate-x-0 transition-[width] ease-in-out duration-300',
        sidebar ? 'w-72' : 'w-[90px]',
      )}>
      {/* ToggleSidebar */}
      <div className='invisible md:visible absolute h-16 flex items-center -right-[16px] z-20'>
        <Button onClick={() => toggleSidebar()} className='rounded-full size-8' variant='outline' size='icon'>
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform ease-in-out duration-300', sidebar ? 'rotate-0' : 'rotate-180')}
          />
        </Button>
      </div>

      <div className='relative h-full flex flex-col overflow-y-auto border-r border-bg-accent'>
        {/* LOGO */}
        <div className='h-16 flex items-center justify-center border-b border-bg-accent mb-2'>
          <Button
            className={cn('transition-transform ease-in-out duration-300', sidebar ? 'translate-x-0' : 'translate-x-1')}
            variant='link'
            asChild>
            <Link
              to='/emission/dashboard'
              className={cn('flex items-center gap-2', companyInfo.metadata.icon ? 'h-full' : '')}>
              {companyInfo.metadata.icon ?
                <img src={companyInfo.metadata.icon} className='w-full h-full' />
              : <>
                  <PanelsTopLeft className='size-6 mr-1' />
                  <h1
                    className={cn(
                      'font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300',
                      sidebar ? 'translate-x-0 opacity-100' : '-translate-x-96 opacity-0 hidden',
                    )}>
                    {companyInfo.name}
                  </h1>
                </>
              }
            </Link>
          </Button>
        </div>

        {/* MENUS */}
        <Menu isOpen={sidebar} />
      </div>
    </aside>
  )
}
