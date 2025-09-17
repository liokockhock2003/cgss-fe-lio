import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { ChemicalSymbol } from '@/components/common-icon.tsx'
import { FormSelectFinancialOrNormal } from '@/components/global-filter/FormSelectFinancialOrNormal.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { ExportCsv } from '@/pages/Emission/Summary/ExportCsv.tsx'
import { createPortal } from 'react-dom'
import { EmissionSummaryProvider } from './Provider.tsx'

EmissionSummaryMainPage.displayName = 'EmissionSummary MainPage'
function EmissionSummaryMainPage() {
  const [breadCrumbRightSideEl, setDomReady] = useState(undefined)

  useEffect(() => {
    setDomReady(document.getElementById('breadcrumb-right-side'))
  }, [])

  return (
    <Card className='h-full flex flex-col'>
      <EmissionSummaryProvider>
        {({ table, query }) => (
          <>
            {matchQueryStatus(query, {
              Errored: (
                <div className='w-full p-5 px-10'>
                  <ErrorBoundary query={query} />
                </div>
              ),
              Loading: <Loading2 />,
              Success: () => (
                <>
                  <CardHeader className='flex-row flex-wrap flex justify-between items-center'>
                    <CardTitle className='flex gap-x-2'>
                      Emission Summary
                      <span className='text-muted-foreground'>({ChemicalSymbol('TONCO2E')})</span>
                    </CardTitle>

                    <div className='flex gap-2 items-center'>
                      <ExportCsv data={table.getRowModel().rows.map((row) => row.original)} />
                    </div>
                  </CardHeader>

                  <CardContent className='h-full flex-1'>
                    <DataTable table={table} />
                  </CardContent>
                </>
              ),
            })}
            {breadCrumbRightSideEl &&
              createPortal(<FormSelectFinancialOrNormal loading={query.isFetching} />, breadCrumbRightSideEl)}
          </>
        )}
      </EmissionSummaryProvider>
    </Card>
  )
}

export const Component = EmissionSummaryMainPage
