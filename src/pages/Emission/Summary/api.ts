import { QueryFactory } from '@/store/query/queryFactory.ts'

type EmissionSummaryMain = {
  rows: {
    scope1: Record<string, { sc: string; mc: string; pe: string; fe: string }>
    scope2: Record<string, { cooling: string; electric: string; heat: string; steam: string }>
    scope3: Record<string, { ec: string; up: string; dw: string; bt: string }>
    production: Record<string, string>
  }

  response: {
    label: string
    production: string
    scope1: { sc: string; mc: string; pe: string; fe: string }
    scope2: { cooling: string; electric: string; heat: string; steam: string }
    scope3: { ec: string; up: string; dw: string; bt: string }
  }
}

const uniqueKey = 'emission-summary'

const main = {
  uniqueKey,
  ...QueryFactory<EmissionSummaryMain['response']>(uniqueKey),
}

////////////////////////////////////////////////////////////////////////////////////

export const EmissionSummaryApi = { main }
export type TEmissionSummary = EmissionSummaryMain
