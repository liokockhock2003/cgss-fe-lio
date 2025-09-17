import {useAppConfiguration, usePlants} from '@/store'
import {cilClipboard, cilGrain, cilMap, cilScrubber, cilSpeedometer} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {CNavGroup, CNavItem, CSidebar, CSidebarBrand, CSidebarNav, CSidebarToggler} from '@coreui/react-pro'
import {kebabCase} from 'lodash-es'
import PropTypes from 'prop-types'
import {memo} from 'react'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import {SidebarNav} from './SideBarNav'

const Sidebar = ({colorScheme, children}) => {
  const appConfig = useAppConfiguration()

  return (
    <CSidebar
      colorScheme={colorScheme}
      position="fixed"
      unfoldable={appConfig.aside === 'fold'}
      visible={appConfig.aside === 'open' || appConfig.aside === 'fold'}>
      <CSidebarBrand className="bg-white hidden md:flex" to="/">
        <img src="/unique_banner.png" alt="logo" className="h-[50px] sidebar-brand-full"/>
        <img src="/unique_logo.png" alt="logo" className="h-[50px] sidebar-brand-narrow"/>
      </CSidebarBrand>
      {children}
      <CSidebarToggler className="hidden lg:flex" onClick={() => appConfig.toggleAside('fold')}/>
    </CSidebar>
  )
}

export const AppSidebar = memo(function _AppSidebar() {
  const {plants} = usePlants()

  return (
    <Sidebar>
      <CSidebarNav>
        <SimpleBar>
          <SidebarNav items={constructNavs(plants)}/>
        </SimpleBar>
      </CSidebarNav>
    </Sidebar>
  )
})

Sidebar.propTypes = {
  logoNegative: PropTypes.any,
  colorScheme: PropTypes.string,
  children: PropTypes.any,
}

function constructNavs(plants) {
  const plantCategories = plants.reduce((acc, p) => {
    const item = {name: p.name, component: CNavItem, className: 'nested-nav-link'}

    if (acc[p.plantCategory.name]) {
      acc[p.plantCategory.name].push(item)
    } else {
      acc[p.plantCategory.name] = [item]
    }

    return acc
  }, {})

  return [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: './dashboard',
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon"/>,
    },
    {
      component: CNavItem,
      name: 'Map',
      to: './map',
      icon: <CIcon icon={cilMap} customClassName="nav-icon"/>,
    },
    {
      component: CNavGroup,
      name: 'Actual Planting',
      icon: <CIcon icon={cilClipboard} customClassName="nav-icon"/>,
      items: Object.entries(plantCategories).map(([key, value]) => ({
        name: key,
        component: CNavGroup,
        className: 'nested-nav-group',
        items: value.map((v) => ({...v, to: `/plant-actual/${kebabCase(v.name)}`})),
      })),
    },
    {
      component: CNavItem,
      name: 'Target Planting',
      to: './plant-target',
      icon: <CIcon icon={cilScrubber} customClassName="nav-icon"/>,
    },
    {
      component: CNavGroup,
      name: 'Growth',
      icon: <CIcon icon={cilClipboard} customClassName="nav-icon"/>,
      items: Object.entries(plantCategories).map(([key, value]) => ({
        name: key,
        component: CNavGroup,
        items: value.map((v) => ({...v, to: `./growth/${kebabCase(v.name)}`})),
      })),
    },
    {
      component: CNavItem,
      name: 'Emission',
      to: '/emission/dashboard',
      icon: <CIcon icon={cilGrain} customClassName="nav-icon"/>,
    },
  ]
}
