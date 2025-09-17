import { ReloadQuery } from '@/components/ReloadQuery.tsx'
import { gwp_symbols } from '@/components/common-icon.tsx'
import { CellInlineEdit } from '@/components/tanstack-table/cell/cell-inline-edit.tsx'
import { DataTableColumnHeader } from '@/components/tanstack-table/data-table-column-header.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { Button, buttonVariants } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Input } from '@/components/ui/input.tsx'
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
import { orderBy, set } from 'lodash-es'
import { LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { columnHelper, queryFn, setColVisible } from './TableColumnDef.tsx'

MobileCombustionPage.displayName = 'EmissionFactor > Mobile Combustion Page'

function MobileCombustionPage() {
  const [currentView, setCurrentView] = useState<'electric' | 'others'>('electric')

  const [columnVisibility, onColumnVisibilityChange] = useState({})

  const [sorting, onSortingChange] = useState<SortingState>([{ id: 'name', desc: false }])

  const [data, setData] = useState(undefined)
  const [response, setResponse] = useState([])

  const queryKey = useMemo(() => [EmissionFactoryQuery.uniqueKey, 'scope2'], [])
  const query = useSuspenseQuery({ refetchOnWindowFocus: false, queryKey, queryFn })
  const saveMutation = useMutation(EmissionFactoryQuery.mutationOption({ type: 'edit' }))

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('name', {
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ getValue }) => <div className='whitespace-nowrap p-4 capitalize'>{getValue()}</div>,
        meta: { displayAs: 'Name', headerClass: 'px-4' },
      }),

      ...orderBy(response, ['year'], 'asc').map(({ year }) => {
        return columnHelper.group({
          id: `${year}-wrapper`,
          header: () => year,
          meta: { headerClass: 'px-4' },
          columns: [
            ...(currentView === 'others' ?
              gwp_symbols.map((field) =>
                columnHelper.accessor(`${year}.${field}`, {
                  id: `${year}.${field}`,
                  size: 200,
                  header: ({ column }) => <DataTableColumnHeader column={column} />,
                  meta: { displayAs: field, headerClass: 'px-2', cellClass: 'px-4' },
                  cell: (info) => <CellInlineEdit info={info} />,
                }),
              )
            : []),

            ...(currentView === 'electric' ?
              ['peninsular', 'sabah', 'sarawak'].map((field) =>
                columnHelper.accessor(`electric.${year}.${field}`, {
                  id: `${year}.${field}`,
                  size: 200,
                  header: ({ column }) => <DataTableColumnHeader column={column} />,
                  meta: { displayAs: field, headerClass: 'px-2', cellClass: 'px-4' },
                  cell: (info) => <CellInlineEdit info={info} />,
                }),
              )
            : []),

            columnHelper.accessor(`${year}.url`, {
              id: `${year}.url`,
              maxSize: 300,
              header: ({ column }) => <DataTableColumnHeader column={column} />,
              meta: { displayAs: 'Url', headerClass: 'px-2', cellClass: 'px-4' },
              cell: () => (
                <div className='flex gap-x-2 items-center relative'>
                  <Input placeholder='reference' className='min-w-[150px] pr-7' disabled={true} />
                  <Link className='capitalize absolute right-[10px]' to={''}>
                    <LinkIcon className='size-4 hover:text-primary' />
                  </Link>
                </div>
              ),
            }),
          ],
        })
      }),
    ]
  }, [currentView, response])

  const handleClick = useCallback(
    (view: typeof currentView) => {
      setCurrentView(view)
      onColumnVisibilityChange(setColVisible(response, view))
    },
    [currentView],
  )

  // need to rework, doesn't look nice
  useEffect(() => {
    setData(query.data?.rowData)
    setResponse(query.data?.response ?? [])
    onColumnVisibilityChange(setColVisible(response, currentView))
  }, [query.data])

  const filteredData = useMemo(() => {
    const fn = {
      electric: (i) => i.name === 'electric',
      others: (i) => i.name !== 'electric',
    }[currentView]

    return (data ?? []).filter(fn)
  }, [data, currentView])

  const table = useReactTable({
    columns,
    data: filteredData,
    state: { sorting, columnVisibility },
    initialState: { columnPinning: { left: ['name'], right: ['actions'] } },
    meta: {
      disablePagination: true,
      updateData: (rowIndex: string, colId: string, value: string) => {
        const rowName = table.getRow(rowIndex)?.original?.name // mc_id
        const [year, col] = colId.split('.')

        setData((old) =>
          old.map((o) => {
            if (o.name === rowName) set(o, `${year}.${col}`, +value)

            return o
          }),
        )

        setResponse((old) =>
          old.map((o) => {
            if (o.year === +year) set(o, `scope2.${rowName}.${col}`, +value)

            return o
          }),
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
        <CardTitle className='flex items-center gap-2 mb-0'>Scope 2</CardTitle>

        <div className='md:mx-auto'>
          <Button
            className={cn(
              'rounded-r-none!',
              buttonVariants({ variant: currentView === 'electric' ? 'default' : 'secondary' }),
            )}
            onClick={() => handleClick('electric')}>
            Electric
          </Button>
          <Button
            className={cn(
              'rounded-l-none!',
              buttonVariants({ variant: currentView === 'others' ? 'default' : 'secondary' }),
            )}
            onClick={() => handleClick('others')}>
            Others
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
