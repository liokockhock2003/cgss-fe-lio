import { ChemicalSymbol } from '@/components/common-icon.tsx'
import { Badge } from '@/components/ui/badge.tsx'
import { cn } from '@/utilities/cn.ts'
import { valueFormatter } from '@/utilities/formatter.ts'
import type { EmissionIntensity } from './helper.ts'

export const EmissionIntensitySummary = ({
  baseline,
  year,
  isFY,
  emissions: { base, against },
}: {
  year: number
  isFY: boolean
  baseline: number
  emissions: { base: EmissionIntensity['afterBaseline']; against: EmissionIntensity['afterBaseline'] }
}) => {
  return (
    !baseline ?
      <>
        <IconCustomEmptyState className='size-10' />
        <span className='ml-2 text-center text-muted-foreground'>baseline not selected</span>
      </>
      //   NOTES: there is some problem if company financialYearStartMonth null or 1
    : !base || !against ?
      <>
        <div className='flex flex-col text-center text-muted-foreground'>
          <p>unable to match.</p>
          <div>
            Please help key-in
            <code className='mx-1 rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'>
              production
            </code>
            &
            <code className='mx-1 rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'>
              emission
            </code>
            data for {year}
          </div>
        </div>
      </>
    : <>
        <Badge
          variant='outline'
          className={cn(
            'text-[1.25vw] font-semibold border-transparent',
            against.percent.eq(0) ? 'bg-muted text-muted-foreground'
            : against.percent.lt(0) ? 'bg-green-300 text-green-900'
            : 'bg-red-200 text-red-900',
          )}>
          {against.percent.abs().toFixed(2)}%
        </Badge>

        <div className='flex mb-1 leading-7 gap-x-1 text-[0.972vw]'>
          against
          <span>
            {isFY ? 'FY' : ''}
            {baseline}
          </span>
        </div>

        <h1 className='font-extrabold tracking-tight scroll-m-20 lg:text-4xl'>
          {valueFormatter(base.emissionIntensity.toNumber(), { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
        </h1>
        <div className='text-sm font-medium leading-none text-muted-foreground'>{ChemicalSymbol('TONCO2E')}/t</div>
      </>
  )
}
