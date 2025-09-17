export const Months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const
export const MonthsHashed = Months.reduce((acc, m, index) => {
  acc[m] = index + 1
  acc[index + 1] = m
  return acc
}, {})

export const Unit = {
  kwh: { longName: 'Kilowatt-hour' },
  kJ: { longName: 'kiloJoule' },
  ton: { longName: 'tonne' },
  m3: { longName: 'Cubic metre' },
  gj: { longName: 'Giga Joule' },
} as const

export type MonthlyActivities = Record<
  string /* year */,
  Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12, number>
>

/** @deprecated */
export type GroupByResponse<T = unknown> = {
  id: number
  name: string
  details: ({
    activities: MonthlyActivities
    id: number
    status: 'active' | 'inactive'
  } & T)[]
}

/** @deprecated */
export type RowData<T = never> = {
  id: number
  groupByName: string
  groupById: number
  status: 'active' | 'inactive'
  activities: Record<
    string /* year */,
    Record<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12, number> & { emission?: never; total: number } // emission will return only on dev mode, total will be added on runtime
  >
} & T
