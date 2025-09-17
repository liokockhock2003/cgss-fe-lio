import { Input } from '@/components/ui/input.tsx'
import { get } from 'lodash-es'

// import { cn } from '@/utilities/cn.ts'
// import { RotateCcw } from 'lucide-react'
// import { Button } from '../ui/button'

export function CellInlineEdit({
  info: {
    row: { index: rowIndex },
    column: { id: colId },
    table,
  },
}) {
  // const initialValue = getValue()
  const initialValue = get(table.getRow(rowIndex)?.original, colId) ?? 0

  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue)
  // const [initValue, setInitValue] = useState(undefined)

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    table.options.meta?.updateData(rowIndex, colId, value)
  }

  // useEffect(() => setInitValue(initialValue), [])

  // If the initialValue is changed external, sync it up with our state
  // useEffect(() => {
  //   if (original.id === 'solid-anthracite' && colId === '2020.heat_content') {
  //     console.log(rowIndex, colId, getValue(), initialValue)
  //   }
  //
  //   setValue(initialValue)
  // }, [initialValue])

  return (
    <div className='relative flex items-center'>
      <Input
        // className={cn(initValue === +value ? '' : 'border-primary')}
        value={value as string}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
      />
      {/*{initValue === +value ? null : (*/}
      {/*  <Button*/}
      {/*    variant='ghost'*/}
      {/*    size='icon'*/}
      {/*    onClick={() => setValue(initValue)}*/}
      {/*    className='rounded-full absolute right-[20px] size-5'>*/}
      {/*    <RotateCcw className='h-4 w-4' />*/}
      {/*  </Button>*/}
      {/*)}*/}
    </div>
  )
}
