import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart.tsx'
import { cn } from '@/utilities/cn.ts'
import { valueFormatter } from '@/utilities/formatter.ts'
import Decimal from 'decimal.js'
import humanFormat from 'human-format'
import { Label, LabelList, Pie, PieChart } from 'recharts'
import { type DashboardEmissionResponse } from './helper.ts'

const chartConfig = {
  emissions: {
    label: 'Emissions',
  },
} satisfies ChartConfig

export function PieScopes({ data = [] }: { data: DashboardEmissionResponse['pieScopes'] }) {
  const isEmpty = useMemo(() => data.every((i) => i.emissions.eq(0)), [data])

  const total = useMemo(
    () =>
      data.reduce((acc, c) => {
        acc = acc.add(c.emissions)
        return acc
      }, new Decimal(0)),
    [data],
  )

  return (
    <Card className='flex flex-col w-full h-full lg:w-1/3'>
      <CardHeader className='flex flex-row flex-wrap items-center justify-between flex-shrink-0 pb-0'>
        <CardTitle className='flex gap-x-2'>Overall</CardTitle>
      </CardHeader>

      <>
        {isEmpty ?
          <CardContent className='flex flex-col items-center justify-center flex-1 gap-4'>
            <IconCustomEmptyState className='w-20 h-20' />
            <p className='text-lg'>Sorry no data</p>
          </CardContent>
        : <CardContent className='flex flex-col items-center justify-center flex-1 gap-2 py-4'>
            <PieContainer data={data} total={humanFormat(total.toNumber())} />
            <TreeContainer total={total} />
          </CardContent>
        }
      </>
    </Card>
  )
}

const TreeContainer = memo(({ total }: { total: Decimal }) => {
  const _total = total
    .times(1000)
    .dividedBy(20 * 40)
    .toNumber()

  const _totalFormatted = valueFormatter(_total, { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div className='flex items-center justify-center gap-2 text-balance'>
      <figure>
        <img src='/icons/tree.svg' className='size-10' alt='Tree image' />
        <figcaption className='hidden'>
          <a
            href='https://www.freepik.com/free-vector/isolated-tree-white-background_4382376.htm'
            target='_blank'
            rel='noopener noreferrer'
            className='underline'>
            Image by brgfx on Freepik
          </a>
        </figcaption>
      </figure>
      <p>
        Equivalent to <b className='bold'>{_totalFormatted}</b> tree{_total > 1 ? 's' : ''} need to be planted.
      </p>
    </div>
  )
})

const PieContainer = memo(({ data, total }: { data: DashboardEmissionResponse['pieScopes']; total: string }) => {
  const _data = data.map((_) => ({ ..._, emissions: _.emissions.toNumber() }))

  return (
    <ChartContainer
      config={chartConfig}
      className='flex-1 aspect-square pb-0 [&_.recharts-pie-label-text]:fill-foreground'>
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              hideLabel
              tooltipRenderer={({ item }) => {
                return (
                  <>
                    <div className={cn('inline-flex flex-1 justify-between leading-none gap-1.5')}>
                      <div className='capitalize text-muted-foreground'>{item.name}</div>

                      <span className='flex gap-1 font-mono font-medium tabular-nums text-foreground'>
                        {valueFormatter(item.value as number)}
                      </span>

                      <span className='flex gap-1 font-mono font-medium tabular-nums text-foreground'>
                        ({valueFormatter(item.payload.percentage.toNumber())}%)
                      </span>
                    </div>
                  </>
                )
              }}
            />
          }
        />

        <Pie data={_data} innerRadius={50} outerRadius={90} strokeWidth={5} dataKey='emissions' nameKey='type'>
          <LabelList
            dataKey='type'
            className='fill-background'
            stroke='none'
            fontSize={12}
            formatter={(value: keyof typeof chartConfig) => chartConfig[value]?.label}
          />

          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor='middle' dominantBaseline='middle'>
                    <tspan x={viewBox.cx} y={viewBox.cy} className='text-2xl font-bold fill-foreground'>
                      {total}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className='fill-muted-foreground'>
                      emissions
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
})

//

// ref
// Contoh pengiraan per year:
//   Company emitted 10 ton/yr total 2024
// Pokok absorb 20 kg/yr/tree
// Pokok per year = 20 kg /1000 then 10 ton/yr bahagi 0.02 ton/yr/tree = 500 trees (tapi kalau dorg tanam pokok this year, next year pokok tu boleh absorb lg, tu yg pening)
//
// Contoh pengiraan as whole lifetime pokok:
//   Company emitted 10 ton/yr total 2024
// Pokok absorb 20 kg/yr/tree
// Let says average lifetime pokok 25 tahun (so total absorb whole lifetime is 500 kg/tree)
// Pokok equivalent = 500 kg/1000 = 0.5 ton then 10 ton/yr bahagi 0.5 ton/trees = 20 trees/yr
//
//
// 3.12 * 1000 (convert to kg) / 20  = 156 number of tree per year
//
// •⁠  ⁠Equivalent to 156 tree per year
// •⁠  ⁠emission intensity yaxis both letak label
//
// system
// - absoprtion rate
// - jenis pokok
// - lifetime
