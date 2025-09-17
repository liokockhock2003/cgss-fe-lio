import { AuthUserProvider } from '@/store'
import { Outlet } from 'react-router-dom'

export const LayoutBase = () => {
  return (
    <AuthUserProvider>
      <Outlet />
    </AuthUserProvider>
  )
}
