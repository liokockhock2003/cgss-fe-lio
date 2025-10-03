import { Loading2 } from '@/components/Loading.tsx'
import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx'
import { CompanyConfigurationQuery } from '@/store/query/company-configuration.ts'

export const SelectBaseline = ({
  shouldAppendFY = true,
  baseline,
  setBaseline,
  isLoading,
}: {
  shouldAppendFY?: boolean
  baseline: number
  setBaseline: (s: number) => void
  isLoading: boolean
}) => {
  const [{ isFY }] = useGlobalFilter()
  const appendFY = shouldAppendFY ? isFY ? 'FY' : '' : '' // prettier-ignore
  const configData = CompanyConfigurationQuery.getData()

  const yearsOptions = useMemo(() => {
    const minYear = configData?.activitiesStartFrom ? new Date(configData?.activitiesStartFrom).getFullYear() : 2000
    return Array.from({ length: new Date().getFullYear() - minYear }, (_, i) => new Date().getFullYear() - i)
  }, [configData?.activitiesStartFrom])

  return (
    <Select value={baseline ? baseline + '' : undefined} onValueChange={(selectedYear) => setBaseline(+selectedYear)}>
      <SelectTrigger className='flex w-full gap-x-2'>
        {isLoading ?
          <Loading2 className='w-4 h-4 opacity-50' />
        : <SelectValue placeholder='Select baseline' />}
      </SelectTrigger>
      <SelectContent className='w-auto'>
        <SelectGroup>
          {yearsOptions.length === 0 ?
            <div className='flex flex-col items-center justify-center gap-1 w-100'>
              <IconCustomEmptyState className='size-10' />
              <span className='ml-2 text-center text-muted-foreground'>
                Sorry no data. <br />
                please fill in emissions and productions
              </span>
            </div>
          : null}
          {yearsOptions.map((year, i) => (
            <SelectItem className='capitalize' key={i} value={year + ''}>
              {appendFY}
              {year}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
