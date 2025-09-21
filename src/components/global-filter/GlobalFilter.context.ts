import { q$ } from '@/store'
import { currentDate, getFiscalYearRange } from '@/utilities/date.ts'
import { isWithinInterval } from 'date-fns'
import { createParser, createSerializer, parseAsArrayOf, parseAsInteger, useQueryStates } from 'nuqs'
import { matchPath, useLocation } from 'react-router-dom'
import * as v from 'valibot'

export const parseYearSchema = v.pipe(
  v.string(),
  v.transform((input) => {
    if (!input) {
      return ['financial', 'latest']
    }

    let isFY = 'normal'
    if (/^FY/i.test(input)) {
      isFY = 'financial'
      input = input.replace(/^FY/i, '')
    }

    const yearSchema = v.pipe(v.number(), v.minValue(1970), v.maxValue(currentDate.getFullYear() + 1))
    const inputParsed = v.safeParse(yearSchema, parseFloat(input))
    return [isFY, inputParsed.success ? inputParsed.output : currentDate.getUTCFullYear()]
  }),
)

type YearParse = ['normal' | 'financial', number | 'latest']
export const defaultYearParams = ['financial', 'latest'] as YearParse

const yearParser = createParser<YearParse>({
  parse: (query) => {
    const res = v.safeParse(parseYearSchema, query)
    return res.success ? (res.output as YearParse) : ['normal', currentDate.getUTCFullYear()]
  },
  serialize: ([isFy, year]) => `${isFy === 'financial' ? 'FY' : ''}${year}`,
})

const globalParams = {
  groupByIds: parseAsArrayOf(parseAsInteger).withDefault([]),
  year: yearParser.withDefault(defaultYearParams).withOptions({ clearOnDefault: true }),
  // view: parseAsString.withDefault('annual').withOptions({ clearOnDefault: true }),
}

export function useGlobalFilter() {
  const [state, setState] = useQueryStates(globalParams, { urlKeys: { groupByIds: 'groupBys' } })
  const [fiscalYearType, queryYear] = state.year ?? []
  const isFY = fiscalYearType === 'financial'

  const [from, to] = useMemo(() => {
    let start: Date, end: Date
    const currentYear = currentDate.getFullYear()

    if (isFY) {
      const financialYearStartMonth = q$.General.CompanyInfoQuery.financialYearStartMonth() ?? 1

      const [FYCurrentYear, FYNextYear] = [
        getFiscalYearRange(currentYear - 1, financialYearStartMonth),
        getFiscalYearRange(currentYear, financialYearStartMonth),
      ]

      if (queryYear === 'latest') {
        if (isWithinInterval(currentDate, { start: FYCurrentYear[0], end: FYCurrentYear[1] })) {
          ;[start, end] = FYCurrentYear
        } else if (isWithinInterval(currentDate, { start: FYNextYear[0], end: FYNextYear[1] })) {
          ;[start, end] = FYNextYear
        }
      } else {
        ;[start, end] = getFiscalYearRange(queryYear - 1, financialYearStartMonth)
      }
    } else {
      // Default to calendar year
      const _year = queryYear === 'latest' ? currentYear : queryYear

      start = new Date(Date.UTC(_year, 0, 1, 0, 0, 0, 0))

      const nextYear = new Date(Date.UTC(_year + 1, 0, 1))
      end = new Date(nextYear.getTime() - 1)
    }

    return [start, end]
  }, [state.year])

  return [{ ...state, isFY, dateRange: [from, to] }, setState] as const
}

// for href
const globalFilterSerializer = createSerializer(globalParams, { urlKeys: { groupByIds: 'groupBys' } })

export function useGlobalFilterSerializer() {
  const [params] = useGlobalFilter()
  return globalFilterSerializer(params)
}

export const useGlobalFilterEnable = () => {
  const { pathname } = useLocation()

  const isEnableGlobalFilter = useMemo(() => {
    const emissionRoutes = ['summary', 'scope1', 'scope2', 'scope3', 'dashboard', 'production'].map((i) => `/emission/${i}/*`)
    const iframeRoutes = ['/dashboard-iframe/*', '/dashboard-iframe'] // Add iframe routes

    const allRoutes = [...emissionRoutes, ...iframeRoutes]
    return allRoutes.find((route) => matchPath(route, pathname))
  }, [pathname])

  return isEnableGlobalFilter
}
