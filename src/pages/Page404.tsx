import { Button } from '@/components/ui/button.tsx'
import { q$ } from '@/store'
import { Link } from 'react-router-dom'

export const Page404 = () => {
  const isEmissionAvailable = q$.General.CompanyInfoQuery.isFeatureAvailable('emission')
  const redirectUrl = isEmissionAvailable ? '/emission/dashboard' : '/'

  return (
    <section className='flex bg-background bg-light min-vh-100 d-flex flex-row items-center h-full'>
      <div className='py-8 px-4 mx-auto max-w-(--breakpoint-xl) lg:py-16 lg:px-6'>
        <div className='mx-auto max-w-(--breakpoint-sm) text-center'>
          <h1 className='mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500'>
            404
          </h1>
          <p className='mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white'>
            {`Something's missing.`}
          </p>
          <p className='mb-4 text-lg font-light text-gray-500 dark:text-gray-400'>
            {`Sorry, we can't find that page. You'll find lots to explore on the home page.`}
          </p>
          <Button asChild>
            <Link to={redirectUrl}>Back to Homepage</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
