import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { CardContent } from '@/components/ui/card.tsx'
import { BusinessTravelHeader } from './Header.tsx'
import { BusinessTravelProvider } from './Provider.tsx'

BusinessTravelPage.displayName = 'BusinessTravel MainPage'
function BusinessTravelPage() {
  return (
    <BusinessTravelProvider>
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
              <BusinessTravelHeader />

              <CardContent className='h-full flex-1'>
                <DataTable table={table} />
              </CardContent>
            </>
          ),
        })
      }
    </BusinessTravelProvider>
  )
}

export const Component = BusinessTravelPage
