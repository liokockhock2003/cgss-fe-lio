import { isAccessible } from '@/components/LayoutNewDashbord/isPriorityAccessible.tsx'
import { useGlobalFilterSerializer } from '@/components/global-filter/GlobalFilter.context.ts'
import { Button } from '@/components/ui/button.tsx'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { routerMenuItems } from '@/router-menu-items.ts'
import { useAuthUser } from '@/store'
import { PriorityValue } from '@/store/authUser.context.ts'
import { cn } from '@/utilities/cn.ts'
import { Ellipsis } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { MenuCollapsibleButton } from './menu-collapsible-button.tsx'

const filterByAccessLevel = <T extends { accessLevel?: PriorityValue }>(
  items: T[],
  checkAccess: (accessLevel?: PriorityValue) => boolean,
): T[] => {
  return items.filter((item) => checkAccess(item.accessLevel))
}

export function Menu({ isOpen }: { isOpen: boolean }) {
  const location = useLocation()
  const isActive = (href: string) => location.pathname.includes(href)
  const { authUser } = useAuthUser()
  const check = isAccessible(authUser.priority)
  const globalFilterParams = useGlobalFilterSerializer()

  const router = useMemo(() => {
    return routerMenuItems({ globalFilterParams })
      .filter((group) => check(group.accessLevel))
      .map((group) => ({
        ...group,
        menus: filterByAccessLevel(group.menus, check).map((menu) => ({
          ...menu,
          submenus: filterByAccessLevel(menu.submenus, check),
        })),
      }))
  }, [authUser.priority, globalFilterParams])

  return (
    <ScrollArea className='[&>div>div[style]]:block! flex-1 h-full'>
      <nav className='h-full w-full'>
        <ul className='flex flex-col items-start space-y-1 px-2'>
          {router.map(({ groupLabel, menus }, index) => (
            <li className={cn('w-full space-y-1', groupLabel ? 'pt-5' : '')} key={index}>
              {/* GROUP LABEL */}
              {isOpen && groupLabel ?
                <p className='text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate'>
                  {groupLabel}
                </p>
              : !isOpen && groupLabel ?
                <Tooltip delayDuration={100}>
                  <TooltipTrigger className='w-full'>
                    <div className='w-full flex justify-center items-center cursor-default'>
                      <Ellipsis className='h-5 w-5' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side='right'>
                    <p>{groupLabel}</p>
                  </TooltipContent>
                </Tooltip>
              : null}

              {/* MENUS */}
              {menus.map((menu, index) =>
                menu.submenus.length === 0 ?
                  <TooltipProvider disableHoverableContent key={index}>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button variant={isActive(menu.href) ? 'secondary' : 'ghost'} asChild>
                          <Link
                            to={menu.href}
                            className={cn(
                              'w-full h-10 gap-x-4',
                              isActive(menu.href) ? 'text-primary!' : '',
                              isOpen ? 'justify-start!' : 'justify-center',
                            )}>
                            <span>
                              <menu.icon size={18} />
                            </span>
                            {isOpen && <p className='truncate translate-x-0 opacity-100 max-w-[200px]'>{menu.label}</p>}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {isOpen === false && <TooltipContent side='right'>{menu.label}</TooltipContent>}
                    </Tooltip>
                  </TooltipProvider>
                : <MenuCollapsibleButton key={index} menu={menu} isOpen={isOpen} />,
              )}
            </li>
          ))}
        </ul>
      </nav>
    </ScrollArea>
  )
}
