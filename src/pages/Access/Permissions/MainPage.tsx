import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { PermissionHeader } from './Header.tsx'
import { PermissionProvider } from './Provider.tsx'

PermissionMainPage.displayName = 'Permission MainPage'
function PermissionMainPage() {
  return (
    <Card className='h-full flex flex-col'>
      <PermissionProvider>
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
                <PermissionHeader />

                <CardContent className='h-full flex-1'>
                  <DataTable table={table} />
                </CardContent>
              </>
            ),
          })
        }
      </PermissionProvider>
    </Card>
  )
}

export const Component = PermissionMainPage
