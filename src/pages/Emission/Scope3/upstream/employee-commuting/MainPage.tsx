import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { CardContent } from '@/components/ui/card.tsx'
import { EmployeeCommutingHeader } from './Header.tsx'
import { EmployeeCommutingProvider } from './Provider.tsx'

EmployeeCommutingPage.displayName = 'EmployeeCommuting MainPage'
function EmployeeCommutingPage() {
  return (
    <EmployeeCommutingProvider>
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
              <EmployeeCommutingHeader />

              <CardContent className='h-full flex-1'>
                <DataTable table={table} />
              </CardContent>
            </>
          ),
        })
      }
    </EmployeeCommutingProvider>
  )
}

export const Component = EmployeeCommutingPage
