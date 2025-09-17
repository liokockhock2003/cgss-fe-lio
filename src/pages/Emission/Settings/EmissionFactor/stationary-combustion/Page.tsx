import { ReloadQuery } from '@/components/ReloadQuery.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { EmissionFactoryQuery } from '@/store/query/emission-factor.ts'
import { invalidateQuery } from '@/store/query/query-client.ts'
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

function StationaryCombustionPage() {
  const [sorting, onSortingChange] = useState<SortingState>([{ id: 'name', desc: false }])
  const [columnVisibility, onColumnVisibilityChange] = useState({})
  const [data, setData] = useState([])
  const [response, setResponse] = useState([])

  const queryKey = useMemo(() => [EmissionFactoryQuery.uniqueKey, 'stationary_combustion'], [])
  const query = useSuspenseQuery({ refetchOnWindowFocus: false, queryKey, queryFn })
  const saveMutation = useMutation(EmissionFactoryQuery.mutationOption({ type: 'edit' }))

  useEffect(() => {
    setData(query.data?.rowData ?? [])
    setResponse(query.data?.response ?? [])
  }, [query.data])

  const table = useReactTable({
    columns: query.data?.columns ?? [],
    data,
    state: { sorting, columnVisibility },
    initialState: { columnPinning: { left: ['name'], right: ['actions'] } },
    meta: {
      disablePagination: true,
      updateData: (rowIndex: string, colId: string, value: string) => {
        setData((old) => set(old, `${rowIndex}.${colId}`, +value))

        const rowId = table.getRow(rowIndex)?.original?.id // st_id
        const [year, col] = colId.split('.')
        setResponse((old) =>
          old.map((o) =>
            o.year === +year ?
              {
                ...o,
                stationary_combustion: o.stationary_combustion.map((st) =>
                  st.id === rowId ? { ...st, [col]: +value } : st,
                ),
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
        <CardTitle className='flex items-center gap-2 mb-0'>Stationary Combustion</CardTitle>

        <div className='flex items-center gap-2'>
          <ReloadQuery query={query} />

          <Button
            disabled={query.isError || query.isFetching}
            onClick={async () => {
              await saveMutation.mutateAsync({ id: '', payload: response })
              invalidateQuery([...queryKey])
            }}>
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

StationaryCombustionPage.displayName = 'EmissionFactor > Stationary Combustion Page'
export const Component = StationaryCombustionPage
