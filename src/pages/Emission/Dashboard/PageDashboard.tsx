import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { Scopes } from '@/pages/Emission/Dashboard/Scope/Scopes.tsx'
import { Metrics } from '@/pages/Emission/Dashboard/Widget/Widget.tsx'
import { cn } from '@/utilities/cn.ts'
import { useMainHeightAuto } from '@/utilities/use-dom-ready.ts'
import { useMemo } from 'react'
import { MainEmissionIntensity } from './Intensity/MainEmissionIntensity.tsx'
import styles from './PageDashboard.module.scss'

function EmissionDashboardPage() {
  useMainHeightAuto()

  const [{ dateRange: [from, to], groupByIds }] = useGlobalFilter() // prettier-ignore
  const params = useMemo(() => ({ from, to, groupByIds }), [from, to, groupByIds])

  return (
    <div className={cn(styles.emissionDashboard, 'flex flex-col w-full h-full gap-4 p-4 pt-0 pb-0 box-border')}>
      {groupByIds.length <= 0 ?
        <div className='flex flex-col items-center justify-center flex-1 gap-4'>
          <IconCustomEmptyState className='w-20 h-20' />
          <p className='text-lg'>Please create group</p>
        </div>
      : <>
          <div
            className='flex justify-center flex-1 min-h-0 gap-4 overflow-hidden'
            style={{ maxHeight: 'calc(92vh - 6.65vw)' }}>
            {/* Left side */}
            <div className='flex flex-col w-[80%] min-h-0 gap-2 overflow-hidden'>
              {/* Main Emission Intensity */}
              <div className='flex-[9] min-h-0 overflow-hidden'>
                <div className='w-full h-full overflow-auto'>
                  <MainEmissionIntensity params={params} />
                </div>
              </div>

              {/* Scopes */}
              <div className='flex-[10] min-h-0 overflow-hidden'>
                <div className='w-full h-full overflow-auto'>
                  <Scopes params={params} />
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className='w-[20%] overflow-hidden'>
              <div className='h-full overflow-auto'>
                <Metrics params={params} />
              </div>
            </div>
          </div>
        </>
      }
    </div>
  )
}

EmissionDashboardPage.displayName = 'EmissionDashboardPage'
export const Component = EmissionDashboardPage
