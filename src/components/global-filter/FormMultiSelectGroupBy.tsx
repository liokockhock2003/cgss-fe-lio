import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts';
import { useTableParsers } from '@/components/tanstack-table/data-table-queries.tsx';
import { MultipleSelector4 } from '@/components/ui/multi-select4.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { q$, useAuthUser } from '@/store';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';

export const FormMultiSelectGroupBy = () => {
  const [{ groupByIds }, setGlobalFilter] = useGlobalFilter()
  const [_, setTableQueries] = useTableParsers()
  const { authUser } = useAuthUser()
  const isAdmin = authUser.priority <= 3

  const resetTableQueries = () => {
    setTableQueries((p) => ({ ...p, pageIndex: 0, q: '' }))
  }

  const dropdownGroupQuery = useSuspenseQuery(
    q$.General.GroupByQuery.list({
      onSuccess: async (responseData) => {
        if (groupByIds?.length === 0) {
          await setGlobalFilter({ groupByIds: responseData.map((i) => i.id) })
        }

        return responseData
      },
    })({ params: { filter: { fields: ['name', 'id'], where: { status: 'active' } } } }),
  )

  useEffect(() => {
    if (groupByIds.length === 0) {
      dropdownGroupQuery.refetch()
    }
  }, [])

  return (
    <MultipleSelector4
      disabled={dropdownGroupQuery.isLoading || dropdownGroupQuery.data?.length === 0}
      values={groupByIds.map((_) => _ + '')}
      options={dropdownGroupQuery.data?.map((g) => ({ value: g.id + '', label: g.name, id: g.id }))}
      onChange={(e) => {
        if (e.length === 0) return true

        resetTableQueries()
        setGlobalFilter({ groupByIds: e.map((_) => +_) })
      }}
      CustomOptionTemplate={({ option }) => {
        return (
          <div className="flex justify-between w-full">
            <div>{option.label}</div>
            {
              isAdmin
                ? null
                : authUser.groupByIds.includes(option.id)
                  ? null
                  : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Eye className='size-4 opacity-25' />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="capitalize flex gap-x-2">
                    View-only
                  </TooltipContent>
                </Tooltip>
              )
            }
          </div>
        )
      }}
      CustomLabelTemplate={({ value }) => {
        return (
          <div>
            {value?.length === 0 ?
              'Select any group'
            : value?.length === dropdownGroupQuery.data?.length ?
              'All Groups'
            : `${value.length} selected`}
          </div>
        )
      }}
    />
  )
}
