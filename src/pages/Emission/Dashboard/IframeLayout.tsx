// Create: src/pages/Emission/Dashboard/IframeLayout.tsx
import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { GlobalFilter } from '@/components/global-filter/GlobalFilter.tsx'
import { Scopes } from '@/pages/Emission/Dashboard/Scope/Scopes.tsx'
import { Metrics } from '@/pages/Emission/Dashboard/Widget/Widget.tsx'
import { cn } from '@/utilities/cn.ts'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { useMemo } from 'react'
import { MainEmissionIntensity } from './Intensity/MainEmissionIntensity.tsx'
import styles from './PageDashboard.module.scss'

function IframeLayout() {
  const [{ dateRange: [from, to], groupByIds }] = useGlobalFilter() // prettier-ignore
  const params = useMemo(() => ({ from, to, groupByIds }), [from, to, groupByIds])

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={200}>
      <div className='flex flex-col w-screen h-screen overflow-hidden bg-gray-900'>
        {/* Global Filter Header */}
        <div className='flex-none p-4 bg-gray-900 border-b border-gray-900'>
          <div className='flex items-center justify-between'>
            <h1 className='text-lg font-semibold'>Emission Dashboard</h1>
            <div id='breadcrumb-right-side' className='flex items-center gap-x-2'>
              <GlobalFilter />
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div
          className={cn(styles.emissionDashboard, 'flex flex-col w-full h-full gap-4 p-4 box-border overflow-hidden')}>
          {groupByIds.length <= 0 ?
            <div className='flex flex-col items-center justify-center flex-1 gap-4'>
              <IconCustomEmptyState className='w-20 h-20' />
              <p className='text-lg'>Please create group</p>
            </div>
          : <>
              <div
                className='flex justify-center flex-1 min-h-0 gap-4 overflow-hidden'
                style={{ maxHeight: 'calc(100vh - 100px)' }}>
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
      </div>
    </TooltipProvider>
  )
}

IframeLayout.displayName = 'IframeLayout'
export const Component = IframeLayout
