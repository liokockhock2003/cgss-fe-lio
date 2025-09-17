import { cn } from '@/utilities/cn.ts'
import { CContainer, CRow } from '@coreui/react-pro'
import { Bars } from 'react-loader-spinner'

export const Loading = ({ message }: { message?: string }) => {
  return (
    <div className='bg-gray-50 dark:bg-gray-900 h-full d-flex flex-row align-items-center'>
      <CContainer>
        <CRow>
          <div className='flex flex-col justify-center items-center'>
            <p>{message ? message : 'Please Wait ...'}</p>
            <Bars
              height='200'
              width='300'
              color={'currentColor'}
              ariaLabel='loading-indicator'
              wrapperClass='text-black dark:text-white'
            />
          </div>
        </CRow>
      </CContainer>
    </div>
  )
}

export const Loading2 = ({ className }: { className?: string }) => {
  return (
    <div className='flex justify-center h-full items-center'>
      <svg
        className={cn('animate-spin h-20 w-20 text-primary', className)}
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
      </svg>
    </div>
  )
}
