import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { Scope2Header } from './Header.tsx'
import { Scope2Provider } from './Provider.tsx'

Scope2MainPage.displayName = 'Scope2 MainPage'
function Scope2MainPage() {
  return (
    <Card className='h-full flex flex-col'>
      <Scope2Provider>
        {({ table, query }) =>
          matchQueryStatus(query, {
            Errored: (
              <div className='w-full p-5 px-10'>
                <ErrorBoundary query={query} />
              </div>
            ),
            Loading: <Loading2 />,
            Success: () => (
              <>
                <Scope2Header />

                <CardContent className='h-full flex-1'>
                  <DataTable table={table} />
                </CardContent>
              </>
            ),
          })
        }
      </Scope2Provider>
    </Card>
  )
}

export const Component = Scope2MainPage
