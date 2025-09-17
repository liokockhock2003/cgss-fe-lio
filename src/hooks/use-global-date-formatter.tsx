import { useGlobalFilter } from '@/components/global-filter/GlobalFilter.context.ts'
import { globalDateFilterFormat } from '@/utilities/date.ts'

export function useGlobalDateFormat() {
  const [
    {
      year: [type],
    },
  ] = useGlobalFilter()
  const dateFormatter = useMemo(() => globalDateFilterFormat(type), [type])

  return dateFormatter
}
