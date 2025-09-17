import {CBadge, CSidebarNav} from '@coreui/react-pro'
import PropTypes from 'prop-types'

import {NavLink, useLocation} from 'react-router-dom'

const navLink = (name, icon, badge) => {
  return (
    <>
      {icon && icon}
      {name && <span>{name}</span>}
      {badge && (
        <CBadge color={badge.color} className="ms-auto">
          {badge.text}
        </CBadge>
      )}
    </>
  )
}

const navItem = (item, index) => {
  const { component: Component, name, badge, icon, ...rest } = item

  return (
    <Component
      {...(rest.to &&
        !rest.items && {
          component: NavLink,
        })}
      key={index}
      {...rest}>
      {navLink(name, icon, badge)}
    </Component>
  )
}

const navGroup = (item, index, location) => {
  const { component: Component, name, icon, to, ...rest } = item
  return (
    <CSidebarNav key={index}>
      <Component
        idx={String(index)}
        key={index}
        toggler={navLink(name, icon)}
        visible={location.pathname.startsWith(to)}
        {...rest}>
        {item.items?.map((item, index) => (item.items ? navGroup(item, index, location) : navItem(item, index)))}
      </Component>
    </CSidebarNav>
  )
}

export const SidebarNav = ({ items }) => {
  const location = useLocation()

  return (
    <>{items && items.map((item, index) => (item.items ? navGroup(item, index, location) : navItem(item, index)))}</>
  )
}

SidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
