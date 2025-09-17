import { AuthQuery } from './authQuery.ts'
import { CommonQuery } from './common.ts'
import { CompanyInfoQuery } from './company-info.ts'
import { EmissionFactoryQuery } from './emission-factor.ts'
import { EmployeeCommuting, employeeCommuting } from './employee-commuting.ts'
import { EmployeeRegistryQuery } from './employee-registry.ts'
import { fugitiveEmission, FugitiveEmission } from './fugitive-emission.ts'
import { GroupByQuery } from './group-by.ts'
import { MobileCombustion, mobileCombustion } from './mobile-combustion.ts'
import { MobileRegistryQuery } from './mobile-registry.ts'
import { invalidateQuery, queryClient } from './query-client.ts'
import { Scope2, scope2 } from './scope2.ts'
import { stationaryCombustion, type StationaryCombustion } from './stationary-combustion.ts'

export const q$ = {
  invalidateQuery,
  queryClient,
  General: {
    AuthQuery,
    GroupByQuery,
    MobileRegistryQuery,
    EmployeeRegistryQuery,
    EmissionFactoryQuery,
    CompanyInfoQuery,
    CommonQuery,
  },
  scope: {
    _1: { stationaryCombustion, fugitiveEmission, mobileCombustion },
    _2: scope2,
    _3: { employeeCommuting },
  },
} as const

export type Q$ = {
  general: {
    groupByQuery: typeof GroupByQuery
    EmployeeRegistryQuery: typeof EmployeeRegistryQuery
    MobileRegistryQuery: typeof MobileRegistryQuery
    EmissionFactoryQuery: typeof EmissionFactoryQuery
  }
  scope: {
    _1: {
      stationaryCombustion: StationaryCombustion
      mobileCombustion: MobileCombustion
      fugitiveEmission: FugitiveEmission
    }
    _2: Scope2
    _3: {
      employeeCommuting: EmployeeCommuting
    }
  }
}
