import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { ChemicalSymbol } from '@/components/common-icon.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { MultipleSelector4 } from '@/components/ui/multi-select4.tsx'
import {
  DashboardEmissionResponse,
  dashboardEmissionSchema,
  transform,
} from '@/pages/Emission/Dashboard/Scope/helper.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { useQuery } from '@tanstack/react-query'
import Decimal from 'decimal.js'
import humanFormat from 'human-format'
import * as v from 'valibot'
import { BarChartEmissionByScope } from './BarChartEmissionByScope.tsx'
import { PieScopes } from './PieScopes.tsx'

export const Scopes = ({ params }) => {
  const [selected, setSelected] = useState<string[]>([])

  const query = useQuery<DashboardEmissionResponse>({
    queryKey: ['dashboard', 'emission-by-scope', params],
    enabled: v.safeParse(dashboardEmissionSchema, params).success,
    staleTime: 60 * 1000 * 5, // 5min
    queryFn: async () => {
      return axios
        .get('/dashboard/emission-by-scope', { params: { ...params, ...isDebug() } })
        .then((i) => i.data)
        .then(transform)
    },
  })

  useEffect(() => {
    setSelected(query.data?.pieScopes.map((i) => i.type) ?? [])
  }, [query.data?.pieScopes])

  const { pieData, stackedBarData } = useMemo(() => {
    return {
      pieData: query.data?.pieScopes.filter((i) => selected.includes(i.type)),
      stackedBarData: query.data?.stackedBar.map((i) => ({
        ...i,
        scope1: selected.includes('Scope 1') ? i.scope1 : new Decimal(0),
        scope2: selected.includes('Scope 2') ? i.scope2 : new Decimal(0),
        scope3: selected.includes('Scope 3') ? i.scope3 : new Decimal(0),
      })),
    }
  }, [selected, query.data])

  const _options = useMemo(
    () => query.data?.pieScopes.map((g) => ({ value: g.type, label: g.type })),
    [query.data?.pieScopes],
  )

  return (
    <Card className='flex flex-col flex-1 w-full h-full'>
      <CardHeader className='flex flex-row flex-wrap items-center justify-between'>
        <CardTitle className='flex gap-x-0.5 items-end'>
          Scopes
          <span className='text-muted-foreground'>({ChemicalSymbol('TONCO2E')})</span>
        </CardTitle>

        <div className='w-max-content'>
          <MultipleSelector4
            enableSearch={false}
            values={selected}
            options={_options}
            onChange={setSelected}
            CustomOptionTemplate={({ option }) => (
              <div className='flex items-center justify-between w-full'>
                <span>{option.label}</span>
                <span>{humanFormat(pieData?.find((_) => _.type === option.value)?.emissions.toNumber() ?? 0)}</span>
              </div>
            )}
            CustomLabelTemplate={({ value }) => {
              return (
                <div>
                  {value?.length === 0 ?
                    'Select scope'
                  : value?.length === query.data?.pieScopes.length ?
                    'All scopes'
                  : `${value.length} selected`}
                </div>
              )
            }}
          />
        </div>
      </CardHeader>

      {matchQueryStatus(query, {
        Errored: (
          <div className='w-full p-5'>
            <ErrorBoundary query={query} />
          </div>
        ),
        Loading: (
          <CardContent className='flex items-center justify-center h-full py-20'>
            <Loading2 />
          </CardContent>
        ),
        Success: () => (
          <CardContent className='flex flex-wrap flex-1 h-full gap-4 overflow-hidden lg:flex-nowrap'>
            <PieScopes data={pieData} />
            <BarChartEmissionByScope data={stackedBarData} />
          </CardContent>
        ),
      })}
    </Card>
  )
}
