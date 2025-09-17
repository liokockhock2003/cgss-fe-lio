// import { q$ } from '@/store'
// import { axios } from '@/utilities/axios-instance.ts'
// import { queryOptions } from '@tanstack/react-query'

const qks = {
  // minYear: ['common', 'min-year', 'emissions'],
}
// type Def = { emissions: number; production: number }

export const CommonQuery = {
  qks,
  // minYear: queryOptions({
  //   queryKey: qks.minYear,
  //   queryFn: async () => await axios.get<Def>('min-year').then((i) => i.data),
  // }),
  // getMinYear: () => q$.queryClient.getQueryData<Def>(CommonQuery.qks.minYear),
}
