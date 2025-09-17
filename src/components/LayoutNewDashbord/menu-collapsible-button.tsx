import { Button } from '@/components/ui/button.tsx'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { Group } from '@/router-menu-items.ts'
import { cn } from '@/utilities/cn.ts'
import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export function MenuCollapsibleButton({ menu, isOpen }: { menu: Group['menus'][number]; isOpen: boolean }) {
  const location = useLocation()
  const isActive = (href: string) => location.pathname.includes(href)

  const isSubmenuActive = menu.submenus.some((submenu) => isActive(submenu.href))
  const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive)

  return isOpen ?
      <Collapsible open={isCollapsed} onOpenChange={setIsCollapsed} className='w-full space-y-1'>
        <CollapsibleTrigger className='[&>div>div>svg]:-rotate-90 [&[data-state=open]>div>div>svg]:rotate-0' asChild>
          <Button variant={isSubmenuActive ? 'secondary' : 'ghost'} className='w-full justify-start h-10'>
            <div className='w-full items-center flex justify-between'>
              <div className={cn('flex items-center', isSubmenuActive ? 'text-primary' : '')}>
                <span className='mr-4'>
                  <menu.icon size={18} />
                </span>
                <p
                  className={cn(
                    'max-w-[150px] truncate',
                    isOpen ? 'translate-x-0 opacity-100' : '-translate-x-96 opacity-0',
                  )}>
                  {menu.label}
                </p>
              </div>
              <div
                className={cn('whitespace-nowrap', isOpen ? 'translate-x-0 opacity-100' : '-translate-x-96 opacity-0')}>
                <ChevronDown size={18} className='transition-transform duration-200' />
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className='nav-collapsible relative overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down space-y-1'>
          {menu.submenus.map(({ href, label }, index) => (
            <Button
              key={index}
              variant={isActive(href) ? 'secondary' : 'ghost'}
              className='w-full justify-start h-10 relative nav-collapsible__item items-center'
              asChild>
              <Link to={href}>
                <p
                  className={cn(
                    'max-w-[170px] truncate',
                    isOpen ? 'translate-x-0 opacity-100' : '-translate-x-96 opacity-0',
                    isActive(href) ? 'text-primary' : '',
                  )}>
                  {label}
                </p>
              </Link>
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    : <DropdownMenu>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={isSubmenuActive ? 'secondary' : 'ghost'}
                  className={cn('w-full h-10', isOpen ? 'justify-start!' : 'justify-center')}>
                  <div className='flex items-center'>
                    <span className={cn(isOpen === false ? '' : 'mr-4')}>
                      <menu.icon size={18} />
                    </span>
                    {isOpen && (
                      <p
                        className={cn(
                          'max-w-[200px] truncate',
                          isSubmenuActive ? 'text-primary' : '',
                          isOpen ? 'opacity-100' : 'opacity-0',
                        )}>
                        {menu.label} collapse
                      </p>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side='right' align='start' alignOffset={2}>
              {menu.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuContent side='right' sideOffset={15} align='start'>
          <DropdownMenuLabel className='min-w-[190px] truncate'>{menu.label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {menu.submenus.map(({ href, label }, index) => (
            <DropdownMenuItem key={index} asChild>
              <Link className={cn('cursor-pointer mt-0.5', isActive(href) ? 'bg-accent text-primary' : '')} to={href}>
                <p className='max-w-[180px] truncate'>{label}</p>
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuArrow className='fill-border' />
        </DropdownMenuContent>
      </DropdownMenu>
}
