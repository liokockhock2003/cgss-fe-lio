// import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
// import { Loading2 } from '@/components/Loading.tsx'
// import { ChemicalSymbol } from '@/components/common-icon.tsx'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
// import { MultipleSelector4 } from '@/components/ui/multi-select4.tsx'
// import { type UseQueryResult } from '@tanstack/react-query'
// import humanFormat from 'human-format'
// import { orderBy, sumBy } from 'lodash-es'
// import { Label, LabelList, Pie, PieChart } from 'recharts'
// import { type DashboardEmissionResponse } from './helper.ts'
//
// const chartConfig = {
//   emissions: { label: 'Emissions' },
//   electric: { label: 'Electric' },
//   heat: { label: 'Heat' },
//   cooling: { label: 'Cooling' },
//   steam: { label: 'Steam' },
// } satisfies ChartConfig
//
// export function PieScope2({ query }: { query: UseQueryResult<DashboardEmissionResponse> }) {
//   const [selected, setSelected] = useState<string[]>([])
//
//   useEffect(() => {
//     setSelected(query.data?.pieScope2.map((i) => i.type) ?? [])
//   }, [query.data?.pieScope2])
//
//   const _data = useMemo(
//     () => query.data?.pieScope2.filter((item) => selected.includes(item.type)) ?? [],
//     [selected, query.data?.pieScope2],
//   )
//
//   const isEmpty = useMemo(() => _data.every((i) => i.emissions === 0), [_data])
//
//   const total = useMemo(() => humanFormat(sumBy(_data, 'emissions')), [_data])
//
//   const _options = useMemo(
//     () => orderBy(query.data?.pieScope2, 'emissions', 'desc').map((g) => ({ value: g.type, label: g.type })),
//     [query.data?.pieScope2],
//   )
//
//   return (
//     <Card className='flex flex-col h-full'>
//       <CardHeader className='flex-row flex justify-between items-center pb-0 flex-wrap'>
//         <CardTitle className='flex gap-x-2'>
//           Scope 2<span className='text-muted-foreground'>({ChemicalSymbol('TONCO2E')})</span>
//         </CardTitle>
//
//         <div className='w-max-content'>
//           <MultipleSelector4
//             enableSearch={false}
//             values={selected}
//             options={_options}
//             onChange={setSelected}
//             CustomOptionTemplate={({ option }) => (
//               <div className='flex justify-between items-center w-full'>
//                 <span>{option.label}</span>
//                 <span>{humanFormat(query.data?.pieScope2.find((_) => _.type === option.value)?.emissions)}</span>
//               </div>
//             )}
//             CustomLabelTemplate={({ value }) => (
//               <div>
//                 {value?.length === 0 ?
//                   'Select types'
//                 : value?.length === query.data?.pieScope2.length ?
//                   'All types'
//                 : `${value.length} selected`}
//               </div>
//             )}
//           />
//         </div>
//       </CardHeader>
//       <CardContent className='flex-6 pb-0 h-full flex items-center justify-center'>
//         {query.isPending ?
//           <Loading2 />
//         : query.isError ?
//           <div className='w-full p-5'>
//             <ErrorBoundary query={query} />
//           </div>
//         : _data.length === 0 || isEmpty ?
//           <div className='flex items-center justify-center flex-col gap-4'>
//             <IconCustomEmptyState className='w-20 h-20' />
//             <p className='text-lg'>Sorry no data</p>
//           </div>
//         : <ChartContainer
//             config={chartConfig}
//             className='h-full mx-auto aspect-square max-h-[300px] pb-0 [&_.recharts-pie-label-text]:fill-foreground'>
//             <PieChart>
//               <ChartTooltip content={<ChartTooltipContent hideLabel />} />
//               <Pie innerRadius={60} strokeWidth={5} data={_data} dataKey='emissions' nameKey='type'>
//                 <LabelList
//                   dataKey='type'
//                   className='fill-background'
//                   stroke='none'
//                   fontSize={12}
//                   formatter={(value: keyof typeof chartConfig) => chartConfig[value]?.label}
//                 />
//
//                 <Label
//                   content={({ viewBox }) => {
//                     if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
//                       return (
//                         <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
//                           <tspan x={viewBox.cx} y={viewBox.cy} className='fill-foreground text-2xl font-bold'>
//                             {total}
//                           </tspan>
//                           <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className='fill-muted-foreground'>
//                             emissions
//                           </tspan>
//                         </text>
//                       )
//                     }
//                   }}
//                 />
//               </Pie>
//             </PieChart>
//           </ChartContainer>
//         }
//       </CardContent>
//     </Card>
//   )
// }
