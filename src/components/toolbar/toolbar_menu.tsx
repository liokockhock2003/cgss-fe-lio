import {CHeaderNav, CNavItem, CNavLink} from '@coreui/react-pro'
import {NavLink} from 'react-router-dom'

export const ToolbarMenu = () => {
  return (
    <CHeaderNav className="d-none d-md-flex me-auto">
      <CNavItem>
        <CNavLink to="./dashboard" component={NavLink}>
          Dashboard
        </CNavLink>
      </CNavItem>
      <CNavItem>
        <CNavLink href={'./'}>Users</CNavLink>
      </CNavItem>
      <CNavItem>
        <CNavLink href={'./'}>Settings</CNavLink>
      </CNavItem>
    </CHeaderNav>
  )
}
