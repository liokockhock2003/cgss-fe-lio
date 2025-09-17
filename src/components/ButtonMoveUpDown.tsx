import { Button, ButtonProps } from '@/components/ui/button.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { ChevronDown, ChevronUp } from 'lucide-react'

export const ButtonMoveUpDown = ({
  propsUpAction,
  propsDownAction,
}: {
  propsDownAction?: ButtonProps
  propsUpAction?: ButtonProps
}) => {
  return (
    <div className='flex flex-col items-center border rounded-md overflow-hidden'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className='h-5 p-0 border-b w-full rounded-none' variant='ghost' type='button' {...propsUpAction}>
            <ChevronUp className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='right'>Move to top</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button className='h-5 p-0 w-full rounded-none' variant='ghost' type='button' {...propsDownAction}>
            <ChevronDown className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='right'>Move down</TooltipContent>
      </Tooltip>
    </div>
  )
}
