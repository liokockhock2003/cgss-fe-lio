import {cilApplicationsSettings} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {CHeaderToggler} from '@coreui/react-pro'
import {useState} from 'react'

export const ToolbarAsideToggler = () => {
  const [asideToggle, setAsideToggle] = useState(false)

  const onAsideToggler = () => {
    setAsideToggle(!asideToggle)
  }

  return (
    <CHeaderToggler className="px-md-0 me-md-3" onClick={onAsideToggler}>
      <CIcon icon={cilApplicationsSettings} size="lg" />
    </CHeaderToggler>
  )
}
