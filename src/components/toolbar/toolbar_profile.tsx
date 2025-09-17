import { useAuthUser } from '@/store'
import { axios } from '@/utilities/axios-instance'
import { cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeaderNav,
  CNavLink,
} from '@coreui/react-pro'
import { NavLink, useNavigate } from 'react-router-dom'

export const ToolbarProfile = () => {
  const navigate = useNavigate()
  const { setAuthUser } = useAuthUser()

  return (
    <CHeaderNav className='ms-3 me-4'>
      <CDropdown variant='nav-item' alignment='end'>
        <CDropdownToggle placement='bottom-end' className='py-0' caret={false}>
          <CAvatar src='/unique_logo.png' size='md' />
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem component='div' className='p-0'>
            <NavLink className='no-underline py-3!' to={'/profile'}>
              {({ isActive }) => (
                <CNavLink component='span' className='pl-4!' active={isActive}>
                  <CIcon icon={cilUser} className='me-2' />
                  Profile
                </CNavLink>
              )}
            </NavLink>
          </CDropdownItem>

          <CDropdownDivider />

          <CDropdownItem
            onClick={async () => {
              try {
                setAuthUser(undefined)
                await axios.get('/v1/users/logout')
                localStorage.removeItem('token')
                localStorage.removeItem('refresh_token')
                navigate('/login', { replace: true })
              } catch (e) {
                //
              }
            }}
            className='py-2'>
            <CIcon icon={cilLockLocked} className='me-2' />
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </CHeaderNav>
  )
}
