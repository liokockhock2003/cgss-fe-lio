import { ReloadQuery } from '@/components/ReloadQuery.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { Button, buttonVariants } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { EmissionFactoryQuery } from '@/store/query/emission-factor.ts'
import { cn } from '@/utilities/cn.ts'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { set } from 'lodash-es'
import { queryFn } from './TableColumnDef.tsx'

MobileCombustionPage.displayName = 'EmissionFactor > Mobile Combustion Page'

function MobileCombustionPage() {
  const [currentView, setCurrentView] = useState<'litre' | 'distance'>('distance')

  const setColVisible = (view: typeof currentView) => ({
    'distance-type': view === 'distance',
    'distance-litreId': view === 'distance',
    'litre-id': view === 'litre',
  })
  const [columnVisibility, onColumnVisibilityChange] = useState(setColVisible(currentView))

  const [sorting, onSortingChange] = useState<SortingState>([{ id: 'distance-type', desc: false }])

  const [data, setData] = useState(undefined)
  const [response, setResponse] = useState([])

  const queryKey = useMemo(() => [EmissionFactoryQuery.uniqueKey, 'mobile_combustion'], [])
  const query = useSuspenseQuery({ refetchOnWindowFocus: false, queryKey, queryFn })
  const saveMutation = useMutation(EmissionFactoryQuery.mutationOption({ type: 'edit' }))

  const handleClick = useCallback((view: typeof currentView) => {
    setCurrentView(view)
    onColumnVisibilityChange(setColVisible(view))
  }, [])

  // need to rework, doesn't look nice
  useEffect(() => {
    setData(query.data?.rowData)
    setResponse(query.data?.response ?? [])
  }, [query.data])

  const currentData = useMemo(() => data?.[currentView] ?? [], [data, currentView])

  const table = useReactTable({
    columns: query.data?.columns ?? [],
    data: currentData,
    state: { sorting, columnVisibility },
    initialState: {
      columnPinning: {
        left: currentView ? ['distance-type'] : ['litre-id'],
        right: ['actions'],
      },
    },
    meta: {
      disablePagination: true,
      updateData: (rowIndex: string, colId: string, value: string) => {
        setData((old) => set(old, `${rowIndex}.${colId}`, +value))

        const rowId = table.getRow(rowIndex)?.original?.id // mc_id
        const [year, col] = colId.split('.')

        setResponse((old) =>
          old.map((o) =>
            o.year === +year ?
              {
                ...o,
                mobile_combustion: {
                  ...o.mobile_combustion,
                  [currentView]: o.mobile_combustion[currentView].map((g) =>
                    g.id === rowId ? { ...g, [col]: +value } : g,
                  ),
                },
              }
            : o,
          ),
        )
      },
    },
    onSortingChange,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
  })

  return (
    <Card className='h-full flex flex-col rounded-t-none!'>
      <CardHeader className='flex flex-row items-center justify-between gap-2 flex-wrap'>
        <CardTitle className='flex items-center gap-2 mb-0'>
          Mobile Combustion
          <div>
            (
            {['Litre', 'Distance'].map((i, k) => (
              <span key={k}>
                {k !== 0 ? ', ' : ''}
                {i}
              </span>
            ))}
            )
          </div>
        </CardTitle>

        <div className='md:mx-auto'>
          <Button
            className={cn(
              'rounded-r-none!',
              buttonVariants({ variant: currentView === 'distance' ? 'default' : 'secondary' }),
            )}
            onClick={() => handleClick('distance')}>
            Distance
          </Button>
          <Button
            className={cn(
              'rounded-l-none!',
              buttonVariants({ variant: currentView === 'litre' ? 'default' : 'secondary' }),
            )}
            onClick={() => handleClick('litre')}>
            Litre
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          <ReloadQuery query={query} />

          <Button
            disabled={query.isError || query.isFetching}
            onClick={() => saveMutation.mutate({ id: '', payload: response })}>
            Save
          </Button>
        </div>
      </CardHeader>

      <CardContent className='h-full flex-1'>
        <DataTable table={table} />
      </CardContent>
    </Card>
  )
}

export const Component = MobileCombustionPage
