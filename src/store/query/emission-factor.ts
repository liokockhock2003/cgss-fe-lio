import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { QueryFactory } from './queryFactory.ts'

export type EmissionFactorResponse = {
  id: number
  year: number

  stationary_combustion: {
    state: string
    unit: string
    fuel_types: string
    name: string
    heat_content: number

    CO2: number
    CH4: number
    N2O: number
    id: string // state + kebabCase(name)
  }[]

  mobile_combustion: {
    litre: {
      id: string
      fuel_type: string

      CO2: number
      CH4: number
      N2O: number
    }[]
    distance: {
      vehicle_type: string
      fuel_type: string
      litreId: string // this will point to litre > id above
      id: string // kebabCase(vehicle_type + '-' + fuel_type)

      CO2: number
      CH4: number
      N2O: number
    }[]
  }

  scope2: {
    electric: { Peninsular: number; Sabah: number; Sarawak: number; unit: string }
    steam: { CO2: number; CH4: number; N2O: number }
    cooling: { CO2: number; CH4: number; N2O: number }
    heat: { CO2: number; CH4: number; N2O: number }
  }

  GWP: {
    id: string
    name: string
    symbol: string

    value: number
  }[]

  waste_generated: {
    id: string
    material: string

    recycled: number | null
    landfilled: number
    combusted: number | null
    composted: number | null
    anaerobically_digested_dry: number | null
    anaerobically_digested_wet: number | null
  }[]

  waste_generated_supplier_specific_method: {
    id: string
    name: string
    value: number
  }[]
}

export type EmissionFactorDropdown = {
  stationary_combustion: { state: string; unit: string; fuel_types: string; name: string; id: string }[]

  mobile_combustion: {
    litre: { id: string; fuel_type: string }[]
    distance: { vehicle_type: string; fuel_type: string; litreId: string; id: string }[]
  }

  GWP: { id: string; name: string; symbol: string }[]

  waste_generated: {
    id: string
    material: string
    methods: { id: WasteGeneratedMethod; name: string }[]
  }[]

  waste_generated_method: { id: WasteGeneratedMethod; name: string }[]

  waste_generated_supplier_specific_method: { id: string; name: string }[]
}

type WasteGeneratedMethod =
  | 'recycled'
  | 'landfilled'
  | 'combusted'
  | 'composted'
  | 'anaerobically_digested_dry'
  | 'anaerobically_digested_wet'

const uniqueKey = 'emission-factors'
export const EmissionFactoryQuery = {
  uniqueKey,
  ...QueryFactory<EmissionFactorResponse>(uniqueKey),
  useDropdown: <T extends Exclude<keyof EmissionFactorResponse, 'id' | 'year' | 'scope2'>>(field: T) =>
    useQuery(
      EmissionFactoryQuery.list<EmissionFactorDropdown[T]>({ urlManipulation: (_) => `${_}/dropdown` })({
        params: { field },
      }),
    ),
  useSuspenseDropdown: <T extends Exclude<keyof EmissionFactorResponse, 'id' | 'year' | 'scope2'>>(field: T) =>
    useSuspenseQuery(
      EmissionFactoryQuery.list<EmissionFactorDropdown[T]>({ urlManipulation: (_) => `${_}/dropdown` })({
        params: { field },
      }),
    ),
}
