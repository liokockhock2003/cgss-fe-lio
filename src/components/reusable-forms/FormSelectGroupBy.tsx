import { Button } from '@/components/ui/button.tsx'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { q$, useAuthUser } from '@/store'
import {  useMemo } from 'react'
import { ExternalLink } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { Link } from 'react-router-dom'

export const FormSelectGroupBy = () => {
  const dropdownGroupQuery = q$.General.GroupByQuery.useDropdownQuery()
  const form = useFormContext<{ groupById: number }>()
  const { authUser, ignorePermission } = useAuthUser()
  const allowedIds = useMemo(() => authUser?.groupByIds ?? [], [authUser])

  return (
    <FormField
      control={form.control}
      name='groupById'
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor='select-group' className='flex justify-between items-center'>
            <p>Select Group</p>
            <Button variant='link' asChild className='gap-1' size='sm'>
              <Link to='/emission/settings/manage-group-by'>
                <ExternalLink className='size-5' />
                Manage Group
              </Link>
            </Button>
          </FormLabel>
          <FormControl>
            <Select onValueChange={(e) => field.onChange(parseInt(e))} value={(field.value ?? '') + ''}>
              <SelectTrigger id='select-group' disabled={dropdownGroupQuery.isFetching} className='w-full'>
                <SelectValue placeholder='Select any group' />
              </SelectTrigger>
              {dropdownGroupQuery?.isSuccess && (
                <SelectContent>
                  <SelectGroup>
                    {dropdownGroupQuery?.data.map(({ name, id, status }) => (
                      <SelectItem
                        key={id}
                        value={id + ''}
                        disabled={!ignorePermission && (status === 'inactive' || (allowedIds.length > 0 && !allowedIds.includes(id)))}
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              )}
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
