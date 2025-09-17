import { format } from 'date-fns'
import Decimal from 'decimal.js'
import * as v from 'valibot'

type EmissionResponse = {
  entry: string
  scope1: { sc: string; mc: string; fe: string; pe: string }
  scope2: { heat: string; cooling: string; steam: string; electric: string }
  scope3: { ec: string; bt: string; up: string; dw: string; wg: string }
  production: string
}

export type DashboardEmissionResponse = {
  stackedBar: {
    entry: string
    scope1: Decimal
    scope2: Decimal
    scope3: Decimal
  }[]
  pieScopes: { type: string; emissions: Decimal; fill: string }[]
  total: Decimal
}

export const dashboardEmissionSchema = v.object({
  groupByIds: v.pipe(v.array(v.number()), v.nonEmpty('Please enter your "Group Scope By"'), v.minLength(1)),
  from: v.date(),
  to: v.date(),
})

export const transform = (response: EmissionResponse[]): DashboardEmissionResponse => {
  return response.reduce(
    (acc, c, index) => {
      const scope1 = new Decimal(c.scope1.sc).add(c.scope1.mc).add(c.scope1.fe).add(c.scope1.pe)
      const scope2 = new Decimal(c.scope2.heat).add(c.scope2.cooling).add(c.scope2.steam).add(c.scope2.electric)
      const scope3 = new Decimal(c.scope3.ec).add(c.scope3.bt).add(c.scope3.up).add(c.scope3.dw).add(c.scope3.wg)

      const total = scope1.add(scope2).add(scope3)

      const percentage = {
        scope1: total.eq(0) ? new Decimal(0) : scope1.dividedBy(total).times(100),
        scope2: total.eq(0) ? new Decimal(0) : scope2.dividedBy(total).times(100),
        scope3: total.eq(0) ? new Decimal(0) : scope3.dividedBy(total).times(100),
      }

      acc.total = acc.total.add(total)
      acc.stackedBar.push({ entry: c.entry, scope1, scope2, scope3, percentage })
      acc.pieScopes[0].emissions = acc.pieScopes[0].emissions.add(scope1)
      acc.pieScopes[1].emissions = acc.pieScopes[1].emissions.add(scope2)
      acc.pieScopes[2].emissions = acc.pieScopes[2].emissions.add(scope3)

      if (index === response.length - 1) {
        acc.pieScopes[0].percentage = acc.pieScopes[0].emissions.dividedBy(acc.total).times(100)
        acc.pieScopes[1].percentage = acc.pieScopes[1].emissions.dividedBy(acc.total).times(100)
        acc.pieScopes[2].percentage = acc.pieScopes[2].emissions.dividedBy(acc.total).times(100)
      }

      return acc
    },
    {
      total: new Decimal(0),
      stackedBar: [],
      pieScopes: [
        { type: 'Scope 1', percentage: new Decimal(0), emissions: new Decimal(0), fill: 'var(--chart-5)' },
        { type: 'Scope 2', percentage: new Decimal(0), emissions: new Decimal(0), fill: 'var(--chart-6)' },
        { type: 'Scope 3', percentage: new Decimal(0), emissions: new Decimal(0), fill: 'var(--chart-10)' },
      ],
    },
  )
}

export const tickFormatter =
  (formatter: string) =>
  (e: `${string}-${string}`): string => {
    const [year, month] = e.split('-')
    return `${format(new Date(+year, +month - 1), formatter)}`
  }
