import { Button } from '@/components/ui/button.tsx'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet.tsx'
import { q$ } from '@/store'
import { MenuIcon, PanelsTopLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Menu } from './menu.tsx'

export function MenuSheet() {
  const companyInfo = q$.General.CompanyInfoQuery.getData()

  return (
    <Sheet>
      <SheetTrigger className='md:hidden' asChild>
        <Button className='h-8' variant='outline' size='icon'>
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className='sm:w-72 px-3 h-full flex flex-col' side='left'>
        <SheetHeader>
          <SheetTitle asChild>
            <Button className='flex justify-center items-center pb-2 pt-1' variant='link' asChild>
              <Link to='/emission/dashboard' className='flex items-center gap-2'>
                <PanelsTopLeft className='size-6 mr-1' />
                <h1 className='font-bold text-lg'>{companyInfo.name}</h1>
              </Link>
            </Button>
          </SheetTitle>
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  )
}
