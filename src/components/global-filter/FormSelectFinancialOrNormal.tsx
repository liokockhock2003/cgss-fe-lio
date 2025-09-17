import { Loading2 } from '@/components/Loading.tsx'
import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { Select, SelectContent, SelectGroup, SelectItem, SelectValue } from '@/components/ui/select.tsx'
import { cn } from '@/utilities/cn.ts'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'

export const FormSelectFinancialOrNormal = ({ loading = false }: { loading?: boolean }) => {
  const [{ year }, setter] = useGlobalFilter()

  return (
    <Select
      disabled={loading}
      value={year[0]}
      onValueChange={(next) =>
        setter((prev) => {
          year[0] = next as 'normal' | 'financial'
          return { ...prev, year }
        })
      }>
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
          'w-full flex gap-x-2',
        )}>
        <SelectValue placeholder='select calendar type' />

        <SelectPrimitive.Icon asChild>
          {loading ?
            <Loading2 className='h-4 w-4 opacity-50' />
          : <ChevronDown className='h-4 w-4 opacity-50' />}
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectContent>
        <SelectGroup>
          <SelectItem className='capitalize' value='normal'>
            Normal
          </SelectItem>
          <SelectItem className='capitalize' value='financial'>
            Financial
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
