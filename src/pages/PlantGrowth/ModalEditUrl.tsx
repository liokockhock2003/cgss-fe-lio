import { axios } from '@/utilities/axios-instance'
import { cilLeaf, cilPencil, cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CLoadingButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import PropTypes from 'prop-types'

export const ModalEditUrl = ({ type, data, onApply }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [validated, setValidated] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = (e) => {
    if (e.currentTarget.checkValidity() === false) {
      e.preventDefault()
      e.stopPropagation()
      setValidated(true)
    } else {
      e.preventDefault()
      setLoading(true)
      const formData = new FormData(e.target)
      let payload = Object.fromEntries(formData)
      let url = `/plant-urls`

      if (type === 'edit') {
        url += `/${data.id}`
      } else {
        payload = { ...data, ...payload }
      }

      axios[type === 'edit' ? 'patch' : 'post'](url, payload)
        .then((response) => {
          onApply(response.data)
          setValidated(false)
          setModalVisible(false)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  return (
    <>
      {type === 'create' ?
        <CButton className='flex! items-center' onClick={() => setModalVisible(true)}>
          <CIcon size='xl' icon={cilPlus} className='text-white' />
        </CButton>
      : <CButton color='primary' variant='outline' shape='square' size='sm' onClick={() => setModalVisible(true)}>
          <CIcon icon={cilPencil} />
        </CButton>
      }

      <CModal scrollable visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader style={{ backgroundColor: '#044A89' }} className='text-white text-center'>
          <CModalTitle className='capitalize'>{type} Plant</CModalTitle>
        </CModalHeader>

        <CForm className='needs-validation' noValidate validated={validated} onSubmit={(e) => onSubmit(e)}>
          <CModalBody>
            <CTooltip content='url' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='inputGroup-sizing-default'>
                  <CIcon icon={cilLeaf} />
                </CInputGroupText>
                <CFormInput type='url' defaultValue={data.url} name='url' required />
              </CInputGroup>
            </CTooltip>
          </CModalBody>
          <CModalFooter>
            <CRow>
              <CCol>
                <CLoadingButton type='submit' style={{ backgroundColor: '#044A89', width: '100%' }} loading={loading}>
                  {type === 'create' ? 'Create' : 'Save changes'}
                </CLoadingButton>
              </CCol>
            </CRow>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

ModalEditUrl.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number,
    url: PropTypes.string,
    plantId: PropTypes.number,
  }),
  onApply: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['create', 'edit']).isRequired,
}
