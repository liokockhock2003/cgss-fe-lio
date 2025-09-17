import { useQuery } from '@tanstack/react-query'
import { QueryFactory } from './queryFactory.ts'

export type MobileRegistryResponse = {
  emissionScope1MobileCombustionId: number
  id: number
  identity_no: string
  hasLitreId: boolean
  model: string
  status: 'active' | 'inactive'
  EF_MobileCombustionDistanceId: string
}

const uniqueKey = 'mobile-registry'
export const MobileRegistryQuery = {
  uniqueKey,
  ...QueryFactory<MobileRegistryResponse>(uniqueKey),
  useDropdownQuery: () =>
    useQuery(
      MobileRegistryQuery.list<MobileRegistryResponse[]>()({
        params: {
          filter: {
            fields: ['identity_no', 'id', 'model', 'EF_MobileCombustionDistanceId'],
            where: { status: 'active' },
          },
        },
      }),
    ),
}
