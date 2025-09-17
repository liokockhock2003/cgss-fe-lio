import {usePlants} from '@/store'
import {CDropdownHeader} from '@coreui/react'
import {
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeaderNav,
  CNavLink,
} from '@coreui/react-pro'
import {kebabCase} from 'lodash-es'
import PropTypes from 'prop-types'

import {NavLink} from 'react-router-dom'

export const AppToolbarMenu = () => {
  const { plants } = usePlants()

  const plantCategories = plants.reduce((acc, p) => {
    const item = { name: p.name, to: `/species/${kebabCase(p.name)}` }

    if (acc[p.plantCategory.name]) {
      acc[p.plantCategory.name].push(item)
    } else {
      acc[p.plantCategory.name] = [item]
    }

    return acc
  }, {})

  return (
    <CHeaderNav className="hidden md:flex items-center mr-auto" variant="pills">
      <CDropdown variant="nav-item">
        <CDropdownToggle color="secondary">Manage</CDropdownToggle>
        <CDropdownMenu>
          <ShortNav to="/users" text="Users" />

          <ShortNav to="/states" text="State" />

          <CDropdownDivider />
          <CDropdownHeader>Plant Species</CDropdownHeader>

          {Object.entries(plantCategories).map(([key, value], index) => {
            return (
              <div key={index} className="group relative">
                <div className="dropdown-item p-0">
                  <a className="group-hover no-underline py-3!">
                    <span className="nav-link pl-4!">{key}</span>
                  </a>
                </div>

                <ul
                  className="group-hover:block dropdown-menu rounded border border-gray-200 absolute top-[-8px] left-[101%]"
                  style={{ '--cui-dropdown-link-active-bg': '#cddbe7' }}
                  role="menu"
                  aria-hidden="false">
                  {value.map((v, _id) => (
                    <li className="p-0" key={_id}>
                      <NavLink className="dropdown-item no-underline" to={v.to}>
                        {({ isActive }) => (
                          <CNavLink component="span" className="p-0! text-2xl" active={isActive}>
                            {v.name}
                          </CNavLink>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </CDropdownMenu>
      </CDropdown>
    </CHeaderNav>
  )
}

const ShortNav = ({ to, text }) => {
  return (
    <CDropdownItem component="div" className="p-0">
      <NavLink className="no-underline py-3!" to={to}>
        {({ isActive }) => (
          <CNavLink component="span" className="pl-4!" active={isActive}>
            {text}
          </CNavLink>
        )}
      </NavLink>
    </CDropdownItem>
  )
}

ShortNav.propTypes = {
  to: PropTypes.string,
  text: PropTypes.string,
}
