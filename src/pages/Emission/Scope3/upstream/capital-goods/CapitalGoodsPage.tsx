import { CardContent } from '@/components/ui/card.tsx'
import { Cog } from 'lucide-react'

function CapitalGoodsPage() {
  return (
    <CardContent className='h-full flex-1'>
      <div className='h-full flex items-center justify-center flex-col gap-4 py-10'>
        <Cog className='w-20 h-20 animate-spin' style={{ animationDuration: '5s' }} />
        <p className='text-lg'>Sorry, we still actively working on this</p>
      </div>
    </CardContent>
  )
}

CapitalGoodsPage.displayName = 'CapitalGoodsPage'
export const Component = CapitalGoodsPage
