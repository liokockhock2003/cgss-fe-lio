import { CompanyConfigurationQuery } from '@/store/query/company-configuration.ts'
import type { MonthlyActivities } from '@/utilities/ag-grid.helpers.ts'
import { cn } from '@/utilities/cn.ts'
import { inActiveClass, valueFormatter } from '@/utilities/formatter.ts'
import type { Table } from '@tanstack/react-table'
import { lastDayOfMonth } from 'date-fns'
import Decimal from 'decimal.js'
import type { HTMLAttributes, Ref } from 'react'

export const FooterTotalActivities = forwardRef(function <T extends { activities: MonthlyActivities }>(
  {
    table,
    year,
    month,
    className,
    ...props
  }: {
    table: Table<T>
    year: number
    month: number
  } & HTMLAttributes<HTMLDivElement>,
  ref: Ref<HTMLDivElement>,
) {
  const rows = table.getRowModel().rows
  const activitiesStartFrom = new Date(CompanyConfigurationQuery.getData()?.activitiesStartFrom)
  const shouldDisabled = lastDayOfMonth(new Date(year, month - 1, 1)) <= activitiesStartFrom

  const columnTotal = useMemo(
    () => rows.reduce((total, row) => total.add(row.original.activities[year]?.[month] ?? 0), new Decimal(0)),
    [rows, year, month],
  )

  return (
    <div
      ref={ref}
      // data-cy='FooterTotalActivities'
      className={cn('text-right px-4 py-2', className, shouldDisabled ? inActiveClass : '')}
      {...props}>
      {shouldDisabled ? '--' : valueFormatter(columnTotal.toNumber())}
    </div>
  )
})
FooterTotalActivities.displayName = 'FooterTotalActivities'

export const FooterTotalHeader = forwardRef(function <T extends { activities: MonthlyActivities }>(
  { table, className, ...props }: { table: Table<T> } & HTMLAttributes<HTMLDivElement>,
  ref: Ref<HTMLDivElement>,
) {
  const activitiesStartFrom = new Date(CompanyConfigurationQuery.getData()?.activitiesStartFrom)

  const n = table.getRowModel().rows.reduce((total, row) => {
    const subTotal = Object.entries(row.original.activities ?? {})
      .flatMap(([year, yearlyValues]) => {
        return Object.entries(yearlyValues)
          .filter(([_, monthlyValues]) => typeof monthlyValues !== 'object' && typeof +monthlyValues === 'number') // this is to remove { debug: emission, detail })
          .filter(([month]) => lastDayOfMonth(new Date(+year, +month - 1, 1)) >= activitiesStartFrom)
          .map(([_, v]) => v)
      })
      .reduce((acc, n) => acc.add(n), new Decimal(0))

    return total.add(subTotal)
  }, new Decimal(0))

  return (
    <div
      ref={ref}
      // data-cy='FooterTotalHeader'
      className={cn('text-right px-4 py-2', className)}
      {...props}>
      {valueFormatter(n.toNumber())}
    </div>
  )
})
FooterTotalHeader.displayName = 'FooterTotalHeader'
