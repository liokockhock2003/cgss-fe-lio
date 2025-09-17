import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { UserAccessGroupMapHeader } from './Header.tsx'
import { UserAccessGroupMapProvider } from './Provider.tsx'

UserAccessGroupMapMainPage.displayName = 'UserAccessGroupMap MainPage'
function UserAccessGroupMapMainPage() {
  return (
    <Card className='h-full flex flex-col'>
      <UserAccessGroupMapProvider>
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
                <UserAccessGroupMapHeader />

                <CardContent className='h-full flex-1'>
                  <DataTable table={table} />
                </CardContent>
              </>
            ),
          })
        }
      </UserAccessGroupMapProvider>
    </Card>
  )
}

export const Component = UserAccessGroupMapMainPage
