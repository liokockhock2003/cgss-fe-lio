import {useAppConfiguration} from '@/store'
import {cilMenu} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {CHeaderToggler} from '@coreui/react-pro'

export const ToolbarSidebarToggler = () => {
  const appConfig = useAppConfiguration()

  return (
    <CHeaderToggler className="ps-1" onClick={() => appConfig.toggleAside('open')}>
      <CIcon icon={cilMenu} size="lg" />
    </CHeaderToggler>
  )
}
