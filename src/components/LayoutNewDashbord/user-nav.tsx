import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { useAuthUser } from '@/store'
import { axios } from '@/utilities/axios-instance'
import { LogOut, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export function UserNav() {
  const navigate = useNavigate()
  const { authUser, setAuthUser } = useAuthUser()

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='relative h-8 w-8 rounded-full'>
                <Avatar>
                  {/*<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />*/}
                  <AvatarFallback className='bg-primary hover:bg-primary/90'>
                    {authUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side='bottom'>Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            {authUser.username && <p className='text-sm font-medium leading-none'>{authUser.username}</p>}
            {authUser.email && <p className='text-xs leading-none text-muted-foreground'>{authUser.email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {/*<DropdownMenuItem className='hover:cursor-pointer' asChild>*/}
          {/*  <Link to='/dashboard' className='flex items-center'>*/}
          {/*    <LayoutGrid className='size-4 mr-3 text-muted-foreground' />*/}
          {/*    Dashboard*/}
          {/*  </Link>*/}
          {/*</DropdownMenuItem>*/}
          <DropdownMenuItem className='hover:cursor-pointer' asChild>
            <Link to='/account' className='flex items-center'>
              <User className='size-4 mr-3 text-muted-foreground' />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          className='hover:cursor-pointer'
          onClick={async () => {
            try {
              setAuthUser(undefined)
              await axios.get('/v1/users/logout')
              localStorage.removeItem('token')
              localStorage.removeItem('refresh_token')
              navigate('/login', { replace: true })
            } catch (e) {
              //
            }
          }}>
          <LogOut className='size-4 mr-3 text-muted-foreground' />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
