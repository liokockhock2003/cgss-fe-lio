import { Button } from '@/components/ui/button.tsx'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import type { GridReadyEvent } from '@ag-grid-community/core'
import { Scaling, Shrink } from 'lucide-react'

const resizeColumn = [
  { m: 'sizeColumnsToFit', action: 'Compact columns', icon: <Shrink className='size-5' /> },
  { m: 'autoSizeAllColumns', action: 'Enlarge columns', icon: <Scaling className='size-5' /> },
] as const

export const AgAutoResizeColumn = ({
  gridInstance,
  view = 'normal',
}: {
  view?: 'normal' | 'dropdown-item'
  gridInstance: GridReadyEvent
}) => {
  const [no, setNo] = useState(0)
  const currentWay = resizeColumn[no % 2]

  const handleOnClick = () => {
    setNo((i) => (i > 10 ? 0 : i + 1))
    return gridInstance.api[currentWay.m]()
  }

  return view === 'normal' ?
      <Tooltip>
        <TooltipTrigger asChild>
          <Button disabled={!gridInstance} variant='outline' onClick={handleOnClick}>
            {currentWay.icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{currentWay.action}</TooltipContent>
      </Tooltip>
    : <DropdownMenuItem className='flex gap-4' disabled={!gridInstance} onClick={handleOnClick}>
        {currentWay.icon}
        {currentWay.action}
      </DropdownMenuItem>
}
