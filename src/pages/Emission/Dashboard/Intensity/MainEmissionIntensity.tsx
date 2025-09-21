import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { CompanyConfigurationQuery } from '@/store/query/company-configuration.ts'
import { axios } from '@/utilities/axios-instance.ts'
import { isDebug } from '@/utilities/useDebug.ts'
import { useQuery } from '@tanstack/react-query'
import Decimal from 'decimal.js'
import * as v from 'valibot'
import { EmissionIntensitySummary } from './EmissionIntensitySummary.tsx'
import { LineChartEmissionIntensity } from './LineChartEmissionIntensity.tsx'
import { SelectBaseline } from './SelectBaseline.tsx'
import { dashboardEmissionIntensitySchema, EmissionIntensity, transformIntensity } from './helper.ts'

export function MainEmissionIntensity({ params }) {
  const [{ isFY, dateRange: [, to] }] = useGlobalFilter() // prettier-ignore
  const configData = CompanyConfigurationQuery.getData()
  const [baseline, setBaseline] = useState<number>(configData?.defaultBaseline)

  const query = useQuery<EmissionIntensity['after'][]>({
    queryKey: ['dashboard', 'emission-intensity', params],
    enabled: v.safeParse(dashboardEmissionIntensitySchema, params).success,
    staleTime: 60 * 1000 * 5, // 5min
    queryFn: async () => {
      return axios
        .get('/dashboard/emission-intensity', { params: { ...params, ...isDebug() } })
        .then((i) => i.data)
        .then(transformIntensity)
    },
  })

  const withEmissionIntensity = useMemo(() => {
    if (query.isPending || !baseline) return []

    return (
      query.data?.map((i) => ({
        ...i,
        emissionIntensity: i.production.eq(0) ? new Decimal(0) : new Decimal(i.emissions).dividedBy(i.production),
      })) ?? []
    )
  }, [query.data, baseline, query.isPending])

  const foundBaselineYear = useMemo(
    () => withEmissionIntensity.find((i) => i.entry.includes(baseline + '')),
    [withEmissionIntensity],
  )

  const computedData: EmissionIntensity['afterBaseline'][] = useMemo(() => {
    if (!foundBaselineYear) {
      console.log('Can`t find baseline year', baseline, withEmissionIntensity)
      return []
    }

    return withEmissionIntensity.map((i) => {
      return {
        ...i,
        percent:
          i.emissionIntensity.eq(0) || foundBaselineYear.emissionIntensity.eq(0) ?
            new Decimal(0)
          : new Decimal(i.emissionIntensity)
              .minus(foundBaselineYear.emissionIntensity)
              .dividedBy(foundBaselineYear.emissionIntensity)
              .times(100),
      }
    })
  }, [baseline, foundBaselineYear, withEmissionIntensity])

  const emissions = useMemo(() => {
    const base = computedData.find((i) => i.entry === `${isFY ? 'FY' : ''}${baseline}`)
    const against = computedData.find((i) => i.entry === `${isFY ? 'FY' : ''}${to.getFullYear()}`)
    return { base, against }
  }, [computedData, isFY, baseline, to])

  return (
    <Card className='flex flex-col flex-1 w-full h-full'>
      <CardHeader className='flex flex-row flex-wrap items-center justify-between'>
        <CardTitle className='flex gap-x-0.5 items-end'>Emission Intensity</CardTitle>

        <div className='flex items-center gap-2'>
          <div>Baseline</div>
          <SelectBaseline isLoading={query.isPending} baseline={baseline} setBaseline={setBaseline} />
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
            <Card className='w-full lg:w-1/3'>
              <CardContent className='flex flex-col items-center justify-center h-full p-5'>
                <EmissionIntensitySummary
                  year={to.getFullYear()}
                  isFY={isFY}
                  baseline={baseline}
                  emissions={emissions}
                />
              </CardContent>
            </Card>
            <Card className='w-full lg:w-2/3 [&>div]:h-full [&>div]:w-full shadow-xs'>
              <CardContent className='w-full h-full [&>div]:h-full [&>div]:w-full p-5 pl-0'>
                {!baseline ?
                  <div className='flex flex-col items-center justify-center gap-1 w-100'>
                    <IconCustomEmptyState className='size-10' />
                    <span className='ml-2 text-center text-muted-foreground'>baseline not selected</span>
                  </div>
                : <LineChartEmissionIntensity baseline={baseline} data={computedData} />}
              </CardContent>
            </Card>
          </CardContent>
        ),
      })}
    </Card>
  )
}
