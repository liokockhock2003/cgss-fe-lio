import { cn } from '@/utilities/cn.ts'
import { cilArrowTop } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CSpinner } from '@coreui/react-pro'
import humanFormat from 'human-format'
import { sum } from 'lodash-es'
import { usePlantBreakdown } from './ProviderPlantBreakdown'

export const ChartSummary = () => {
  const { data, loading } = usePlantBreakdown()

  if (loading) {
    return (
      <div className='flex items-center justify-center flex-col my-auto'>
        <CSpinner />
      </div>
    )
  }

  const target = sum(data.target.datasets)
  const actual = sum(data.actual.datasets)
  const shouldShowPercent = target !== 0
  const percent = actual / target
  const percentColor = percent > 0 ? 'text-green-500!' : 'text-red-500!'

  return (
    <div className='flex items-center justify-evenly'>
      <div className='flex flex-col justify-center text-center'>
        <p className='text-sm mb-0 text-gray-400'>Target</p>
        <h4 className='mb-0.5 text-4xl font-bold text-black dark:text-white'>{humanFormat(target)}</h4>
        <p className='hidden sm:block text-sm mb-0 text-gray-400'>plants</p>
      </div>

      <div className='h-full border-1 border-l border-gray-200'></div>

      <div className='flex gap-1.5'>
        <div className='flex flex-col justify-center text-center'>
          <p className='text-sm mb-0 text-gray-400'>Actual</p>
          <h4 className='mb-0.5 text-4xl font-bold text-black dark:text-white'>{humanFormat(actual)}</h4>
          <p className='hidden sm:block  text-sm mb-0 text-gray-400'>planted</p>
        </div>

        {shouldShowPercent ?
          <div className='flex items-center gap-1'>
            <CIcon
              size='xl'
              icon={cilArrowTop}
              className={cn(percent > 0 ? 'rotate-45' : 'rotate-[135deg]', percentColor)}
            />
            <span className={cn('text-sm font-medium', percentColor)}>{humanFormat(percent)}</span>
          </div>
        : null}
      </div>
    </div>
  )
}
