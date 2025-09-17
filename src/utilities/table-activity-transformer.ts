import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { generateYearMonthRange } from '@/utilities/date.ts'
import { chunk, flow } from 'lodash-es'

// const taps = (e) => {
//   console.log(e)
//   return e
// }

export type GenerateListOfYearsAndMonths = ReturnType<typeof useGenerateListOfYearsAndMonths>
export const useGenerateListOfYearsAndMonths = () => {
  const [{ dateRange: [from, to], isFY }] = useGlobalFilter() // prettier-ignore

  const listOfYearsAndMonths = useMemo(() => {
    return flow(
      generateYearMonthRange,
      (ranges) => ranges.map((i) => [i.getFullYear(), i.getMonth() + 1]),
      (ranges: number[][]) => {
        const next =
          isFY ?
            chunk(ranges, 12).reduce((acc, chunked) => {
              acc.set(`FY${to.getFullYear()}`, chunked.map(([year, month]) => ({ year, month }))) // prettier-ignore
              return acc
            }, new Map<string, { year: number; month: number }[]>())
          : ranges.reduce((acc, [year, month]) => {
              const yearStr = year + ''
              const push = { year, month }
              acc.set(yearStr, acc.get(yearStr) ? acc.get(yearStr).concat(push) : [push])
              return acc
            }, new Map<string, { year: number; month: number }[]>())

        return [...next]
      },
    )([from, to])
  }, [from, to])

  return listOfYearsAndMonths
}
