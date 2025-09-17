import { defaultYearParams, useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { useTableParsers } from '@/components/tanstack-table/data-table-queries.tsx'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx'
import { q$ } from '@/store'
import { CompanyConfigurationResponse } from '@/store/query/company-configuration.ts'
import { generateDateRangesAnnually, getYearFromFYFormat } from '@/utilities/date.ts'
import { formatUTC } from '@/utilities/format-utc.ts'
import { format } from 'date-fns'
import { Label } from '../ui/label.tsx'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group.tsx'

export const FormSelectGlobalDateRange = ({ configuration }: { configuration: CompanyConfigurationResponse }) => {
  const financialYearStartMonth = q$.General.CompanyInfoQuery.financialYearStartMonth()
  const [{ year, dateRange: [from, to], isFY }, setGlobalFilter] = useGlobalFilter() // prettier-ignore
  const [_, setTableQueries] = useTableParsers()

  const [calendarType, yearQuery] = year ?? []
  const appendFY = isFY ? 'FY' : ''

  const yearsOptions = useMemo(() => {
    const minYear = new Date(configuration.activitiesStartFrom).getFullYear()

    return generateDateRangesAnnually(minYear, isFY, financialYearStartMonth)
      .map((i) => i.label)
      .toReversed()
  }, [configuration.activitiesStartFrom, financialYearStartMonth, isFY])

  const resetTableQueries = () => {
    setTableQueries((p) => ({ ...p, pageIndex: 0, q: '' }))
  }

  return (
    <Select
      value={`${appendFY}${yearQuery === 'latest' ? to.getUTCFullYear() : yearQuery}`}
      onValueChange={(selectedYear) => {
        const [, parseYear] = getYearFromFYFormat(selectedYear)
        resetTableQueries()
        setGlobalFilter(({ year, ...prev }) => ({
          ...prev,
          year: [calendarType, parseYear],
        }))
      }}>
      <Tooltip delayDuration={100}>
        <TooltipTrigger onFocusCapture={(e) => e.stopPropagation()} className='w-full' asChild>
          <SelectTrigger className='w-full flex gap-x-2'>
            <SelectValue placeholder='Select years' />
          </SelectTrigger>
        </TooltipTrigger>
        <TooltipContent className='flex items-center gap-x-1' side='top' align='end'>
          {format(from, 'do MMM yy')}
          <span className='text-muted-foreground'>to</span>
          {formatUTC(to)}
        </TooltipContent>
      </Tooltip>

      <SelectContent>
        {(
          financialYearStartMonth > 1 // only display this if company have diff FY than Jan
        ) ?
          <>
            <RadioGroup
              className='p-2 gap-2 sticky top-[-4px] bg-background z-1'
              value={calendarType}
              onValueChange={(e: 'financial' | 'normal') => {
                resetTableQueries()
                setGlobalFilter(({ year, ...prev }) => {
                  let setYear = year[1]

                  const isNotDefaultYearParams = e !== defaultYearParams[0] && year[1] === defaultYearParams[1]
                  if (isNotDefaultYearParams) {
                    ;[, setYear] = getYearFromFYFormat(yearsOptions[0])
                  }

                  return { ...prev, year: [e, setYear] }
                })
              }}>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='financial' id='financial' />
                <Label className='w-full cursor-pointer' htmlFor='financial'>
                  Financial
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='normal' id='normal' />
                <Label className='w-full cursor-pointer' htmlFor='normal'>
                  Normal
                </Label>
              </div>
            </RadioGroup>
            <SelectSeparator />
          </>
        : null}

        <SelectGroup>
          {yearsOptions.map((year, i) => (
            <SelectItem className='capitalize' key={i} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
