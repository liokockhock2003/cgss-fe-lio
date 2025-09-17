import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { CardContent, Card } from '@/components/ui/card.tsx'
import { EmissionProductionHeader } from './Header.tsx'
import { EmissionProductionProvider } from './Provider.tsx'

EmissionProductionMainPage.displayName = 'EmissionProductionMainPage'
function EmissionProductionMainPage() {
  return (
    <EmissionProductionProvider>
      {({ table, query }) =>
        matchQueryStatus(query, {
          Errored: (
            <div className='w-full p-5 px-10'>
              <ErrorBoundary query={query} />
            </div>
          ),
          Loading: <Loading2 />,
          Success: () => (
            <Card className='h-full flex flex-col'>
              <EmissionProductionHeader />

              <CardContent className='h-full flex-1'>
                <DataTable table={table} />
              </CardContent>
            </Card>
          ),
        })
      }
    </EmissionProductionProvider>
  )
}

export const Component = EmissionProductionMainPage
