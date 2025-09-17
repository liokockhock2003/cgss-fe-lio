import { Loading2 } from '@/components/Loading'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Toaster } from '@/components/ui/toaster'
import { AppConfigurationProvider, CompanyInfo, q$ } from '@/store'
import { QueryClientProvider, QueryErrorResetBoundary } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import 'core-js/stable'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { StrictMode, Suspense } from 'react'
import 'react-app-polyfill/stable'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { RouterProvider } from 'react-router-dom'
import '../scss/globals.scss'
import { router } from './Router.tsx'
import { Button } from './components/ui/button.tsx'

const container = document.getElementById('root')!
const root = createRoot(container)

root.render(
  <StrictMode>
    <QueryClientProvider client={q$.queryClient}>
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => {
              return (
                <div className='flex h-full items-center justify-center'>
                  <Alert variant='destructive' className='max-w-lg bg-red-200 dark:bg-red-300'>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Please contact admin</AlertDescription>
                    <AlertDescription>{error.message}</AlertDescription>

                    <Button
                      className='mt-2 border border-red-900'
                      variant='destructive'
                      onClick={() => resetErrorBoundary()}>
                      Try again
                    </Button>
                  </Alert>
                </div>
              )
            }}
            onReset={reset}>
            <Suspense fallback={<Loading2 />}>
              <AppConfigurationProvider>
                <CompanyInfo>
                  <NuqsAdapter>
                    <RouterProvider router={router} fallbackElement={<Loading2 />} />
                    <ReactQueryDevtools initialIsOpen={false} />
                  </NuqsAdapter>
                </CompanyInfo>
              </AppConfigurationProvider>
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </QueryClientProvider>
    <Toaster />
  </StrictMode>,
)

// If you want to start measuring performance in your app, pass abc
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()
