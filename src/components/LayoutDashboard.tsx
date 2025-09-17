import { AppSidebar } from '@/components/AppSidebar.tsx'
import { PlantsProvider, q$ } from '@/store'
import { CContainer, CFooter, CHeader, CHeaderDivider, CSpinner } from '@coreui/react-pro'
import { Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AppToolbarMenu } from './AppToolbarMenu'
import { Breadcrumb } from './Breadcrumb'
import { ToolbarProfile } from './toolbar/toolbar_profile'
import { ToolbarSidebarToggler } from './toolbar/toolbar_sidebar_toggler'

// import { AppSidebar, AppToolbarMenu, Breadcrumb, ToolbarProfile, ToolbarSidebarToggler } from './index'

export const LayoutDashboard = () => {
  const isPlantAvailable = q$.General.CompanyInfoQuery.isFeatureAvailable('plant')

  if (!isPlantAvailable) {
    return <Navigate to='/404' />
  }

  return (
    <PlantsProvider>
      <link rel='stylesheet' href='/core-ui.css' />
      <AppSidebar />
      <div className='wrapper d-flex flex-column min-vh-100 bg-light'>
        <CHeader position='sticky'>
          <CContainer fluid>
            <ToolbarSidebarToggler />
            <AppToolbarMenu />
            <ToolbarProfile />
          </CContainer>
          <CHeaderDivider />
          <Breadcrumb />
        </CHeader>

        <div className='body d-flex flex-grow-1 m-3'>
          <CContainer lg className='d-flex flex-column'>
            <Suspense fallback={<CSpinner color='primary' />}>
              <Outlet />
            </Suspense>
          </CContainer>
        </div>

        <CFooter>
          <div>
            <a href='https://research.utm.my/prospect/' target='_blank' rel='noopener noreferrer'>
              UTM
            </a>
            <span className='ms-1'>&nbsp; 2024</span>
          </div>
        </CFooter>
      </div>
    </PlantsProvider>
  )
}
