import { addMonths, isAfter } from 'date-fns'

/**
 * @param startDate
 * @param endDate
 * @returns
 * in [ 2020-12-31T16:00:00.000Z, 2021-12-31T15:59:59.999Z ] output [2021-01, ..., 2021-12]
 */
export function generateYearMonthRange([startDate, endDate]: [startDate: Date, endDate: Date]): Date[] {
  let start = new Date(startDate)
  const end = new Date(endDate)
  const result = []

  while (!isAfter(start, end)) {
    result.push(start)
    start = addMonths(start, 1)
  }

  return result
}

export function getSequenceOFiscalMonths(startMonth: number) {
  return [...Array(12)].map((_, i) => ((startMonth + i - 1) % 12) + 1)
}

export const getFiscalYearRange = (year: number, startMonth: number) => {
  const months = getSequenceOFiscalMonths(startMonth)
  const [monthStart, monthEnd] = [months[0] - 1, months.at(-1)! - 1]

  const start = new Date(Date.UTC(year, monthStart, 1, 0, 0, 0, 0))

  const endYear = year + (monthEnd < monthStart ? 1 : 0)
  const end = new Date(Date.UTC(endYear, monthEnd + 1, 1)) // next month start
  const endUTC = new Date(end.getTime() - 1) // 1ms before next month

  return [start, endUTC]
}

export const globalDateFilterFormat = (type: 'financial' | 'normal'): { short: string; long: string } => {
  return {
    financial: { short: 'LLL yy', long: 'LLLL yyy' },
    normal: { short: 'LLL', long: 'LLLL yyy' },
  }[type]
}

// export const currentDate = new Date(2025, 8, 10)
export const currentDate = new Date()

export function generateDateRangesAnnually(startingYear: number, isFY: boolean, financialYearStartMonth = 1) {
  if (!isFY) financialYearStartMonth = 1

  // Determine the starting year
  const startYear = isFY ? startingYear - 1 : startingYear
  const endYear = currentDate.getFullYear()

  // Check if the current date is beyond the financial year start month
  const currentMonth = currentDate.getMonth() + 1 // 1-based
  const isAfterFiscalYearStart =
    currentMonth >= financialYearStartMonth || (isFY && currentMonth === financialYearStartMonth)

  // Adjust the endYear based on the financial year and current date
  const adjustedEndYear = isAfterFiscalYearStart ? endYear + 1 : endYear

  const ranges = []
  let from = new Date(startYear, financialYearStartMonth - 1, 1) // Start date of the first range

  while (from.getFullYear() < adjustedEndYear) {
    const to = addMonths(from, 12 - 1) // Calculate the end date of the range
    ranges.push({ label: isFY ? `FY${to.getFullYear()}` : `${from.getFullYear()}`, from, to })
    from = addMonths(from, 12) // Move to the next financial year start
  }

  return ranges as { label: string; from: Date; to: Date }[]
  // return ranges.map((i) => ({ label: i.label, from: format(i.from, 'yyyy-MM'), to: format(i.to, 'yyyy-MM'), }));
}

export const getYearFromFYFormat = (strYear: string): [isFY: boolean, year: number] => {
  let year = strYear
  const isFY = strYear.startsWith('FY')

  if (isFY) {
    year = strYear.replace(/^FY/, '')
  }

  return [isFY, +year]
}
