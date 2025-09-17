import { useTableQueries } from '@/components/tanstack-table/data-table-queries.tsx'
import { Button } from '@/components/ui/button.tsx'
import { cn } from '@/utilities/cn.ts'
import { X } from 'lucide-react'
import { InputHTMLAttributes, useEffect } from 'react'
import { useState, forwardRef } from 'react'
import { Input } from './ui/input'

type _SearchInput = {
  q?: string
  debounceTime?: number
}

// this need to be used with TanStackTable
export const SearchInput = forwardRef<HTMLInputElement, _SearchInput & InputHTMLAttributes<HTMLInputElement>>(
  ({ className, debounceTime = 500, ...props }, ref) => {
    const [tableQueries, setTableQueries] = useTableQueries()
    const [search, setSearch] = useState(() => tableQueries.q)
    const deferredSearch = useDeferredValue(search)

    // anytime tableQ been change update it in this comp
    useEffect(() => {
      setSearch(tableQueries.q)
    }, [tableQueries.q])

    // defer the changes
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        setTableQueries((o) => {
          return { ...o, q: deferredSearch, pageIndex: 0 }
        })
      }, debounceTime)

      return () => clearTimeout(timeoutId)
    }, [deferredSearch, debounceTime])

    return (
      <div className='flex items-center relative'>
        <Input
          {...props}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={cn('w-[250px] pr-8', className)}
          ref={ref}
        />
        {search.length > 0 ?
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setSearch('')}
            className='rounded-full absolute right-[10px] size-5'>
            <X className='h-4 w-4' />
          </Button>
        : null}
      </div>
    )
  },
)

SearchInput.displayName = 'SearchInput'
