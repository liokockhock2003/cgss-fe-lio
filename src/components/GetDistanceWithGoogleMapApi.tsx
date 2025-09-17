import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { MapPinned } from 'lucide-react'
import { Button } from './ui/button'

export const GetDistanceWithGoogleMapApi = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className='cursor-not-allowed'>
          <Button variant='link' disabled>
            <MapPinned className='h-5 w-5' />
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent side='top'>Use google map to calculate distance (work in progress)</TooltipContent>
    </Tooltip>
  )
}
