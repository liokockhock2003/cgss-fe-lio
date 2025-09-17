import { endOfYear, startOfYear } from 'date-fns'

export const turnOfUserModifiableFields = {
  createdId: false,
  updatedId: false,
  deletedId: false,
  createdAt: false,
  updatedAt: false,
  deletedAt: false,
}

export const queryDataInMonthOf = (year: number, month: number) => {
  const startMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))

  const nextMonth = new Date(Date.UTC(year, month, 1))
  const endMonth = new Date(nextMonth.getTime() - 1)

  return [{ date: { gte: startMonth } }, { date: { lte: endMonth } }]
}

export const queryDataInYearOf = (year: number) => {
  const startDay = startOfYear(new Date(year, 0, 1)) // January is month 0
  const endDay = endOfYear(new Date(year, 11, 31)) // December is month 11

  return { and: [{ date: { gte: startDay } }, { date: { lte: endDay } }] }
}
