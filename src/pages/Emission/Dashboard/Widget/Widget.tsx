import { ChemicalSymbol } from '@/components/common-icon.tsx'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import { DashboardEmissionResponse } from '@/pages/Emission/Dashboard/Scope/helper.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { valueFormatter } from '@/utilities/formatter.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { useQuery } from '@tanstack/react-query'
import Decimal from 'decimal.js'
import { ReactNode } from 'react'

type WidgetResponse = {
  LPG: string
  'natural-gas': string
  waste: string
  electric: string
  production: string
}

const metrics = [
  {
    unit: <span>{ChemicalSymbol('TONCO2E')} / yr</span>,
    key: 'emissions',
    icon: 'emissions.svg',
    display: 'Emission',
  },
  { unit: <span>ton / yr</span>, key: 'production', icon: 'basket.svg', display: 'Production Value' },
  { unit: <span>kWh / yr</span>, key: 'electric', icon: 'electric-tower.svg', display: 'Electric Consumption' },
  { unit: <span>GJ / yr</span>, key: 'natural-gas', icon: 'natural-gas.svg', display: 'Natural Gas' },
  // { unit: <span>m3 / yr</span>, key: 'gas', icon: 'LPG.svg', display: 'LPG' },
  { unit: <span>ton / yr</span>, key: 'waste', icon: 'waste.svg', display: 'Waste Generated' },
]

export function Metrics({ params }) {
  const scopeQuery = useQuery({
    // @ts-ignore
    queryFn: (): Promise<DashboardEmissionResponse> => {},
    queryKey: ['dashboard', 'emission-by-scope', params],
    enabled: false,
  })

  const query = useQuery<WidgetResponse>({
    queryKey: ['dashboard', 'emission-by-widget', params],
    staleTime: 60 * 1000 * 5, // 5min
    queryFn: async () => {
      return axios.get('/dashboard/emission-by-widget', { params: { ...params, ...isDebug() } }).then((i) => i.data)
    },
  })

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 *:data-[slot=card]:shadow-xs gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card'>
      {metrics.map((metric) => (
        <Card key={metric.display} className='flex relative overflow-hidden group flex-1'>
          <CardHeader className='relative'>
            <CardDescription>{metric.display}</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums my-auto flex'>
              {metric.key === 'emissions' ?
                <DisplayValue
                  isError={scopeQuery.isError}
                  isPending={scopeQuery.isPending}
                  n={scopeQuery.data?.total.toNumber() ?? 0}
                  unit={metric.unit}
                />
              : <DisplayValue
                  isError={query.isError}
                  isPending={query.isPending}
                  n={new Decimal(query.data?.[metric.key] ?? 0).toNumber()}
                  unit={metric.unit}
                />
              }
            </CardTitle>
          </CardHeader>
          <img
            alt='icon'
            src={'/icons/' + metric.icon}
            className='aspect-3/2 opacity-[.15] absolute right-[-20px] top-[40px] w-[100px] h-[100px] blur-[1px] group-hover:blur-none'
          />
        </Card>
      ))}
    </div>
  )
}

const DisplayValue = ({
  isPending,
  isError,
  n,
  unit,
}: {
  isPending: boolean
  isError: boolean
  n: number
  unit: ReactNode
}) => {
  return (
    isPending ? <Skeleton className='w-[100px] h-[20px] rounded-full' />
    : isError ? <div>0</div>
    : <div className='flex flex-col'>
        <div>{valueFormatter(n, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
        <div className='text-sm text-muted-foreground/80'>{unit}</div>
      </div>
  )
}
