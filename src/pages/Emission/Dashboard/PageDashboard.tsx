import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { Scopes } from '@/pages/Emission/Dashboard/Scope/Scopes.tsx'
import { Metrics } from '@/pages/Emission/Dashboard/Widget/Widget.tsx'
import { cn } from '@/utilities/cn.ts'
import { useMainHeightAuto } from '@/utilities/use-dom-ready.ts'
import { MainEmissionIntensity } from './Intensity/MainEmissionIntensity.tsx'
import styles from './PageDashboard.module.scss'

function EmissionDashboardPage() {
  useMainHeightAuto()

  const [{ dateRange: [from, to], groupByIds }] = useGlobalFilter() // prettier-ignore
  const params = useMemo(() => ({ from, to, groupByIds }), [from, to, groupByIds])

  return (
    <div className={cn(styles.emissionDashboard, 'justify-center flex flex-1 gap-4 flex-col')}>
      {groupByIds.length <= 0 ?
        <div className='flex items-center justify-center flex-col gap-4 col-span-full row-span-full'>
          <IconCustomEmptyState className='w-20 h-20' />
          <p className='text-lg'>Please create group</p>
        </div>
      : <>
          <Metrics params={params} />
          <MainEmissionIntensity params={params} />
          <Scopes params={params} />
        </>
      }
    </div>
  )
}

EmissionDashboardPage.displayName = 'EmissionDashboardPage'
export const Component = EmissionDashboardPage
