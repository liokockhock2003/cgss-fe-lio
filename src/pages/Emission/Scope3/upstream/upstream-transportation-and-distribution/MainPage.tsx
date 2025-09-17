import { ErrorBoundary } from '@/components/ErrorBoundry.tsx'
import { Loading2 } from '@/components/Loading.tsx'
import { matchQueryStatus } from '@/components/matchQueryStatus.tsx'
import { DataTable } from '@/components/tanstack-table/data-table.tsx'
import { CardContent } from '@/components/ui/card.tsx'
import { ModalProvider } from '@/utilities/useModal.tsx'
import { Header } from './Header.tsx'
import { UdtdProvider } from './Provider.tsx'
import { DialogUdtd } from './form/DialogUdtd.tsx'

MainPage.displayName = 'Udtd MainPage'
function MainPage() {
  return (
    <UdtdProvider>
      {({ table, query, queryKey }) =>
        matchQueryStatus(query, {
          Errored: (
            <div className='w-full p-5 px-10'>
              <ErrorBoundary query={query} />
            </div>
          ),
          Loading: <Loading2 />,
          Success: () => (
            <ModalProvider>
              {({ isModalOpen }) => (
                <>
                  <Header />

                  <CardContent className='h-full flex-1'>
                    <DataTable table={table} />
                  </CardContent>

                  {isModalOpen(DialogUdtd.modalId) && <DialogUdtd scopeType={queryKey[2].type} />}
                </>
              )}
            </ModalProvider>
          ),
        })
      }
    </UdtdProvider>
  )
}

export const Component = MainPage
