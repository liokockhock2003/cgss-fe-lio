export const Page500 = () => {
  return (
    <section className='flex bg-background bg-light min-vh-100 d-flex flex-row items-center h-full'>
      <div className='py-8 px-4 mx-auto max-w-(--breakpoint-xl) lg:py-16 lg:px-6'>
        <div className='mx-auto max-w-(--breakpoint-sm) text-center'>
          <h1 className='mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500'>
            500
          </h1>
          <p className='mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white'>
            {`Something totally when wrong`}
          </p>

          <p className='text-left'>Some of the reason maybe:</p>
          <ul className='ml-4 list-disc mb-4 text-left text-lg font-light text-gray-500 dark:text-gray-400'>
            <li>Your company already reach the expired date</li>
            <li>Been inactive by us</li>
            <li>Please reach out to admin</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
