import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { Card, CardContent } from '@/components/ui/card.tsx'
import { UserGroupByMapHeader } from './Header.tsx'
import { UserGroupByMapProvider } from './Provider.tsx'

UserGroupByMapMainPage.displayName = 'UserGroupByMap MainPage'
function UserGroupByMapMainPage() {
  return (
    <Card className='h-full flex flex-col'>
      <UserGroupByMapProvider>
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
                <UserGroupByMapHeader />

                <CardContent className='h-full flex-1'>
                  <DataTable table={table} />
                </CardContent>
              </>
            ),
          })
        }
      </UserGroupByMapProvider>
    </Card>
  )
}

export const Component = UserGroupByMapMainPage
