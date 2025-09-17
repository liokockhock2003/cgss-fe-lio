import { cn } from '@/utilities/cn'
import { valueFormatter as _valueFormatter } from '@/utilities/formatter.ts'
import Decimal from 'decimal.js'
import {
  ComponentProps,
  ComponentType,
  createContext,
  CSSProperties,
  forwardRef,
  ReactNode,
  useContext,
  useId,
  useMemo,
} from 'react'
import * as RechartsPrimitive from 'recharts'
import { Payload } from 'recharts/types/component/DefaultLegendContent'

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [k in string]: {
    label?: ReactNode
    icon?: ComponentType
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = createContext<ChartContextProps | null>(null)

function useChart() {
  const context = useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

const ChartContainer = forwardRef<
  HTMLDivElement,
  ComponentProps<'div'> & {
    config: ChartConfig
    children: ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-foreground/80 [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}>
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = 'Chart'

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => config.theme || config.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof RechartsPrimitive.Tooltip> &
    ComponentProps<'div'> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: 'line' | 'dot' | 'dashed'
      nameKey?: string
      labelKey?: string
      withTotal?: boolean
      withUnit?: boolean
      valueFormatter?: (n: number) => string
      // @ts-ignore
      tooltipRenderer?: (payload: { item: any; key: string; itemConfig: any; indicatorColor: string }) => ReactNode
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      valueFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      withTotal,
      labelKey,
      withUnit,
      tooltipRenderer,
    },
    ref,
  ) => {
    const { config } = useChart()

    const tooltipLabel = useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || 'value'}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === 'string' ?
          config[label as keyof typeof config]?.label || label
        : itemConfig?.label

      if (labelFormatter) {
        return <div className={cn('font-medium', labelClassName)}>{labelFormatter(value, payload)}</div>
      }

      if (!value) {
        return null
      }

      return <div className={cn('font-medium', labelClassName)}>{value}</div>
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== 'dot'
    const vFormatter = valueFormatter || _valueFormatter

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className,
        )}>
        {!nestLabel ? tooltipLabel : null}
        <div className='grid gap-1.5'>
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || 'value'}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                  indicator === 'dot' && 'items-center',
                )}>
                {formatter && item?.value !== undefined && item.name ?
                  formatter(item.value, item.name, item, index, item.payload)
                : <>
                    {itemConfig?.icon ?
                      <itemConfig.icon />
                    : !hideIndicator && (
                        <div
                          className={cn('shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)', {
                            'h-2.5 w-2.5': indicator === 'dot',
                            'w-1': indicator === 'line',
                            'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
                            'my-0.5': nestLabel && indicator === 'dashed',
                          })}
                          style={{ '--color-bg': indicatorColor, '--color-border': indicatorColor } as CSSProperties}
                        />
                      )
                    }
                    {tooltipRenderer ?
                      tooltipRenderer({ item, key, itemConfig, indicatorColor })
                    : <div
                        className={cn(
                          'flex flex-1 justify-between leading-none gap-1.5',
                          nestLabel ? 'items-end' : 'items-center',
                        )}>
                        <div className='grid gap-1.5'>
                          {nestLabel ? tooltipLabel : null}
                          <span className='text-muted-foreground'>{itemConfig?.label || item.name}</span>
                        </div>
                        <span className='flex gap-1 font-mono font-medium tabular-nums text-foreground'>
                          {vFormatter(item.value as number)}
                          {withUnit ?
                            <div className='w-[50px]'>{item.unit}</div>
                          : null}
                        </span>
                      </div>
                    }
                  </>
                }
              </div>
            )
          })}

          {withTotal && payload.length > 1 ?
            <div className='flex w-full flex-wrap gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground items-center'>
              <div
                className={'shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg) h-2.5 w-2.5'}
                style={{ '--color-bg': 'grey', '--color-border': 'black' } as CSSProperties}
              />

              <div className={'flex flex-1 justify-between leading-none gap-1.5'}>
                <div className='grid gap-1.5'>
                  <span className='text-muted-foreground'>Total</span>
                </div>
                <span className='font-mono font-medium tabular-nums text-foreground'>
                  {vFormatter(payload.reduce((acc, c) => acc.add(c.value as number), new Decimal(0)).toNumber())}
                </span>
              </div>
            </div>
          : null}
        </div>
      </div>
    )
  },
)
ChartTooltipContent.displayName = 'ChartTooltip'

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = forwardRef<
  HTMLDivElement,
  ComponentProps<'div'> &
    Pick<RechartsPrimitive.LegendProps, 'payload' | 'verticalAlign'> & {
      hideIcon?: boolean
      nameKey?: string
    } & {
      onItemClick: (item: Payload) => void
      activeSeries: string[]
    }
>(({ className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey, onItemClick, activeSeries }, ref) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center gap-4 flex-wrap content-center',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}>
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || 'value'}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            onClick={() => onItemClick(item)}
            className={cn(
              activeSeries.includes(item.dataKey as string) ? 'opacity-40 line-through' : '',
              'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground',
            )}>
            {itemConfig?.icon && !hideIcon ?
              <itemConfig.icon />
            : <div
                className='h-2 w-2 shrink-0 rounded-[2px]'
                style={{
                  backgroundColor: item.color,
                }}
              />
            }
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = 'ChartLegend'

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const payloadPayload =
    'payload' in payload && typeof payload.payload === 'object' && payload.payload !== null ?
      payload.payload
    : undefined

  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === 'string') {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config]
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle }
