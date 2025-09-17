import { gwp_symbols } from '@/components/common-icon.tsx'
import { type EmissionFactorResponse, EmissionFactoryQuery } from '@/store/query/emission-factor.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { splitProps } from '@/utilities/lodash-compose.ts'
import { createColumnHelper } from '@tanstack/react-table'

type Response = Pick<EmissionFactorResponse, 'id' | 'year' | 'scope2'>

type Transformed =
  | (Record<string, { Peninsular: number; Sabah: number; Sarawak: number }> & { name: 'electric' })
  | (Record<string, { CO2: number; N2O: number; CH4: number }> & { name: 'steam' })
  | (Record<string, { CO2: number; N2O: number; CH4: number }> & { name: 'cooling' })
  | (Record<string, { CO2: number; N2O: number; CH4: number }> & { name: 'heat' })

type ExtractByName<T, N extends string> = T extends { name: N } ? T : never

type ElectricType = ExtractByName<Transformed, 'electric'>
type SteamType = ExtractByName<Transformed, 'steam'>
type CoolingType = ExtractByName<Transformed, 'cooling'>
type HeatType = ExtractByName<Transformed, 'heat'>

export const columnHelper = createColumnHelper<Transformed>()

export const queryFn = async () => {
  const params = { filter: { fields: ['id', 'year', 'scope2'] } }

  return await axios
    .get(`/${EmissionFactoryQuery.uniqueKey}`, { params })
    .then((i) => i.data)
    .then((response: Response[]) => {
      const output = response.reduce((acc, c) => {
        ;['cooling', 'heat', 'steam'].forEach((i) => {
          const [_, rest] = splitProps(c.scope2[i], gwp_symbols)

          const obj = (acc.has(i) ? acc.get(i) : rest) as Transformed
          obj[c.year + ''] = _ as never
          acc.set(i, { name: i, ...obj } as SteamType | CoolingType | HeatType)
        })

        const toPush = { [c.year + '']: c.scope2.electric, name: 'electric' }
        acc.set('electric', (acc.has('electric') ? { ...acc.get('electric'), ...toPush } : toPush) as ElectricType)

        return acc
      }, new Map<string, Transformed>())
      const rowData = Array.from(output.values())

      return { rowData, response }
    })
}

export const setColVisible = (response, view: 'electric' | 'others') => {
  const a = response
    .map((i) => i.year)
    .reduce((acc, year) => {
      ;['peninsular', 'sabah', 'sarawak']
        .map((i) => `electric.${year}.${i}`)
        .forEach((k) => (acc[k] = view === 'electric'))

      gwp_symbols.map((i) => `other.${year}.${i}`).forEach((k) => (acc[k] = view === 'others'))

      return acc
    }, {})

  return a
}
