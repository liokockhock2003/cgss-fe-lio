import { queryDataInMonthOf } from '@/utilities/model-filter-helpers.ts'

export const emissionProductionQueryFilter = ({ year, month, id }) => {
  return {
    filter: {
      order: ['date'],
      where: {
        emissionProductionId: id,
        and: queryDataInMonthOf(year, month),
      },
    },
  }
}
