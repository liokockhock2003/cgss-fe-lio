import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { UserAccessGroupPermissionMapHeader } from './Header.tsx'
import { UserAccessGroupPermissionMapProvider } from './Provider.tsx'

UserAccessGroupPermissionMapMainPage.displayName = 'UserAccessGroupPermissionMap MainPage'
function UserAccessGroupPermissionMapMainPage() {
  return (
    <Card className='h-full flex flex-col'>
      <UserAccessGroupPermissionMapProvider>
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
                <UserAccessGroupPermissionMapHeader />

                <CardContent className='h-full flex-1'>
                  <DataTable table={table} />
                </CardContent>
              </>
            ),
          })
        }
      </UserAccessGroupPermissionMapProvider>
    </Card>
  )
}

export const Component = UserAccessGroupPermissionMapMainPage
