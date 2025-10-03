import { ChemicalSymbol } from '@/components/common-icon.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart.tsx'
import { useGlobalDateFormat } from '@/hooks/use-global-date-formatter.tsx'
import { cn } from '@/utilities/cn.ts'
import { valueFormatter, valueToHumanFormatter } from '@/utilities/formatter.ts'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { type DashboardEmissionResponse, tickFormatter } from './helper.ts'

const chartConfig = {
  scope1: { label: 'Scope1', color: 'var(--chart-5)' },
  scope2: { label: 'Scope2', color: 'var(--chart-6)' },
  scope3: { label: 'Scope3', color: 'var(--chart-10)' },
} satisfies ChartConfig

export function BarChartEmissionByScope({ data = [] }: { data: DashboardEmissionResponse['stackedBar'] }) {
  const dateFormatter = useGlobalDateFormat()
  const isEmpty = useMemo(() => data.every((i) => i.scope1.eq(0) && i.scope2.eq(0) && i.scope3.eq(0)) ?? true, [data])

  return (
    <Card className='flex flex-col flex-1 w-full h-full'>
      <CardHeader className='pt-[0.694vw] pb-[0.694vw]'>
        <CardTitle className='text-[1.25vw]'>Emission for each scopes</CardTitle>
      </CardHeader>

      <CardContent className='flex-1 pb-0 pl-0 overflow-hidden pr-[2.778vw]'>
        {isEmpty ?
          <div className='flex flex-col items-center justify-center h-full gap-4'>
            <IconCustomEmptyState className='w-20 h-20' />
            <p className='text-lg'>Sorry no data</p>
          </div>
        : <ChartContainer config={chartConfig} className='w-full h-full'>
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <YAxis
                label={LabelTonCo2e}
                padding={{ top: 25 }}
                width={75}
                tickFormatter={(v) => valueToHumanFormatter(v, { decimals: 2 })}
              />
              <XAxis dataKey='entry' tickMargin={5} tickFormatter={tickFormatter(dateFormatter.short)} />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    withTotal
                    labelFormatter={tickFormatter(dateFormatter.long)}
                    tooltipRenderer={({ item, key }) => {
                      return (
                        <>
                          <div className={cn('flex flex-1 justify-between leading-none gap-1.5')}>
                            <div className='text-muted-foreground capitalize w-[70px]'>{item.name}</div>

                            <span className='flex gap-1 font-mono font-medium tabular-nums text-foreground w-[70px]'>
                              ({valueFormatter(item.payload.percentage[key].toNumber())}%)
                            </span>

                            <span className='flex gap-1 font-mono font-medium tabular-nums text-foreground'>
                              {valueFormatter(item.value as number)}
                            </span>
                          </div>
                        </>
                      )
                    }}
                  />
                }
              />

              <Bar dataKey='scope1' stackId='a' fill={chartConfig.scope1.color} radius={[0, 0, 8, 8]} />
              <Bar dataKey='scope2' stackId='a' fill={chartConfig.scope2.color} radius={[0, 0, 0, 0]} />
              <Bar dataKey='scope3' stackId='a' fill={chartConfig.scope3.color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
        }
      </CardContent>
    </Card>
  )
}

const LabelTonCo2e = (props) => (
  <g>
    <foreignObject
      style={{ color: 'hsl(var(--muted-foreground))' }}
      x={props.viewBox?.x + 30}
      y={0}
      width={props.viewBox?.width}
      height={props.viewBox?.height}>
      {ChemicalSymbol('TONCO2E')}
    </foreignObject>
  </g>
)
