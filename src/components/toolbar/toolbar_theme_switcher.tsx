import {useAppConfiguration} from "@/store";
import {cilMoon, cilSun} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {CButtonGroup, CFormCheck, CHeaderNav} from '@coreui/react-pro'

export const ToolbarThemeSwitcher = () => {
  const {theme, setTheme} = useAppConfiguration()

  return (
    <CHeaderNav className="ms-auto">
      <CButtonGroup aria-label="Theme switch">
        {theme === 'dark' && (
          <CFormCheck
            type="radio"
            button={{color: 'primary'}}
            name="theme-switch"
            id="btn-light-theme"
            autoComplete="off"
            label={<CIcon icon={cilSun}/>}
            onChange={() => setTheme('light')}
          />
        )}
        {(theme === 'light' || theme === 'system') && (
          <CFormCheck
            type="radio"
            button={{color: 'primary'}}
            name="theme-switch"
            id="btn-dark-theme"
            autoComplete="off"
            label={<CIcon icon={cilMoon}/>}
            onChange={() => setTheme('dark')}
          />
        )}
      </CButtonGroup>
    </CHeaderNav>
  )
}
