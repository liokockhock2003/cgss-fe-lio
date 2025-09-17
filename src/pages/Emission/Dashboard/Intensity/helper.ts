import Decimal from 'decimal.js'
import * as v from 'valibot'

export type EmissionIntensity = {
  before: {
    entry: string
    production: string
    scope1: { sc: string; mc: string; fe: string; pe: string }
    scope2: { heat: string; cooling: string; steam: string; electric: string }
    scope3: { ec: string; bt: string; up: string; dw: string; wg: string }
  }
  after: {
    entry: string
    production: Decimal
    emissions: Decimal
  }
  afterBaseline: EmissionIntensity['after'] & { emissionIntensity: Decimal; percent: Decimal }
}

export const dashboardEmissionIntensitySchema = v.object({
  groupByIds: v.pipe(v.array(v.number()), v.nonEmpty('Please enter your "Group Scope By"'), v.minLength(1)),
  from: v.date(),
  to: v.date(),
})

export const transformIntensity = (response: EmissionIntensity['before'][]): EmissionIntensity['after'][] => {
  const res = response.reduce((acc, c) => {
    const scope1 = new Decimal(c.scope1.sc).add(c.scope1.mc).add(c.scope1.fe).add(c.scope1.pe)
    const scope2 = new Decimal(c.scope2.heat).add(c.scope2.cooling).add(c.scope2.steam).add(c.scope2.electric)
    const scope3 = new Decimal(c.scope3.ec).add(c.scope3.bt).add(c.scope3.up).add(c.scope3.dw).add(c.scope3.wg)

    const emissions = scope1.add(scope2).add(scope3)
    acc.push({ entry: c.entry, emissions, production: new Decimal(c.production) })

    return acc
  }, []) as EmissionIntensity['after'][]

  return res
}
