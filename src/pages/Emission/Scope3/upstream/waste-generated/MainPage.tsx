import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { CardContent } from '@/components/ui/card.tsx'
import { WasteGeneratedHeader } from './Header.tsx'
import { WasterGeneratedProvider } from './Provider.tsx'

WasteGeneratedPage.displayName = 'WasteGenerated MainPage'
function WasteGeneratedPage() {
  return (
    <WasterGeneratedProvider>
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
              <WasteGeneratedHeader />

              <CardContent className='h-full flex-1'>
                <DataTable table={table} />
              </CardContent>
            </>
          ),
        })
      }
    </WasterGeneratedProvider>
  )
}

export const Component = WasteGeneratedPage
