import { ChemicalSymbol } from '@/components/common-icon.tsx'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getYearFromFYFormat } from '@/utilities/date.ts'
import { valueFormatter, valueToHumanFormatter } from '@/utilities/formatter.ts'
import { format } from 'date-fns'
import { CartesianGrid, Label, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'
import { EmissionIntensity } from './helper.ts'

const chartConfig = {
  emissionIntensity: { label: 'Emission Intensity', color: 'var(--chart-1)' },
  production: { label: 'Production', color: 'var(--chart-2)' },
} satisfies ChartConfig

export function LineChartEmissionIntensity({
  baseline,
  data,
}: {
  baseline: number
  data: EmissionIntensity['afterBaseline'][]
}) {
  const isEmpty = useMemo(() => {
    if (!data) return true
    return data?.length === 0 || data?.every((i) => i?.emissions.eq(0) && i?.production.eq(0))
  }, [data])

  const toNumber = useMemo(
    () =>
      data.map((i) => ({
        ...i,
        emissionIntensity: i.emissionIntensity.toNumber(),
        production: i.production.toNumber(),
        percent: i.percent.toNumber(),
      })) ?? [],
    [data],
  )

  const baselineEmission = useMemo(() => data.find((i) => i.entry.includes(baseline + '')), [baseline, data])

  return isEmpty ?
      <div className='flex flex-col items-center justify-center h-full gap-4'>
        <IconCustomEmptyState className='w-20 h-20' />
        <p className='text-lg'>Sorry no data</p>
      </div>
    : <ChartContainer config={chartConfig}>
        <LineChart accessibilityLayer data={toNumber} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                withUnit
                valueFormatter={(n) => valueFormatter(n, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                labelFormatter={(e) => {
                  const [isFY, year] = getYearFromFYFormat(e)
                  return `${isFY ? 'FY' : ''}${format(new Date(+year, 0), 'yyyy')}`
                }}
              />
            }
          />

          <Line
            yAxisId='left'
            dataKey='emissionIntensity'
            unit={(<>{ChemicalSymbol('TONCO2E')}/t</>) as unknown as string}
            type='monotone'
            stroke='var(--chart-3)'
            strokeWidth={2}
            dot
          />
          <YAxis
            yAxisId='left'
            dataKey='emissionIntensity'
            orientation='left'
            label={LabelTonCo2e}
            padding={{ top: 55 }}
          />
          <ReferenceLine
            yAxisId='left'
            y={baselineEmission?.emissionIntensity.toNumber()}
            stroke={chartConfig.emissionIntensity.color}
            strokeWidth={3}
            strokeDasharray='8 8'>
            <Label value='Baseline' position='insideBottomLeft' />
          </ReferenceLine>

          <Line
            yAxisId='right'
            dataKey='production'
            unit='ton'
            type='monotone'
            stroke='var(--chart-5)'
            strokeWidth={2}
            dot
          />

          <YAxis
            yAxisId='right'
            dataKey='production'
            orientation='right'
            label={LabelTon}
            padding={{ top: 55 }}
            tickFormatter={(v) => valueToHumanFormatter(v, { decimals: 0 })}
          />

          <XAxis
            dataKey='entry'
            tickLine
            axisLine
            tickMargin={8}
            tickFormatter={(e) => {
              const [isFY, year] = getYearFromFYFormat(e)
              return `${isFY ? 'FY' : ''}${format(new Date(+year, 0), isFY ? 'yy' : 'yyyy')}`
            }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        </LineChart>
      </ChartContainer>
}

const LabelTonCo2e = (props) => (
  <g>
    <foreignObject
      style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.694vw' }}
      x={props.viewBox?.x}
      y={0}
      width={props.viewBox?.width}
      height={props.viewBox?.height}>
      Emission Intensity ({ChemicalSymbol('TONCO2E')} / t)
    </foreignObject>
  </g>
)

const LabelTon = (props) => {
  return (
    <g>
      <foreignObject
        style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.694vw' }}
        x={props.viewBox?.x + 10}
        y={0}
        width={props.viewBox?.width + 2}
        height={props.viewBox?.height}>
        Production (ton)
      </foreignObject>
    </g>
  )
}
