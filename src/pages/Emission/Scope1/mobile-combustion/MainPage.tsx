import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { CardContent } from '@/components/ui/card.tsx'
import { MobileCombustionHeader } from './Header.tsx'
import { MobileCombustionProvider } from './Provider.tsx'

MobileCombustionMainPage.displayName = 'MobileCombustion MainPage'
function MobileCombustionMainPage() {
  return (
    <MobileCombustionProvider>
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
              <MobileCombustionHeader />

              <CardContent className='h-full flex-1'>
                <DataTable table={table} />
              </CardContent>
            </>
          ),
        })
      }
    </MobileCombustionProvider>
  )
}

export const Component = MobileCombustionMainPage
