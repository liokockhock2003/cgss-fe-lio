import { axios } from '@/utilities/axios-instance.ts'
import { useIsComponentMounted } from '@/utilities/use-is-component-mounted'
import { useStateReducer } from '@/utilities/use-state-reducer.ts'
import { cilContact, cilEnvelopeClosed, cilPencil, cilPhone, cilPlus } from '@coreui/icons'
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

export const ModalEditUser = ({ type, data, onApply }) => {
  const isComponentMounted = useIsComponentMounted()

  const [modalVisible, setModalVisible] = useState(false)
  const [validated, setValidated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useStateReducer(data)

  const onSubmit = (e) => {
    if (e.currentTarget.checkValidity() === false) {
      e.preventDefault()
      e.stopPropagation()
      setValidated(true)
    } else {
      e.preventDefault()
      setLoading(true)
      let payload = form
      let url = `/endusers`

      if (type === 'edit') {
        url += `/${data.id}`
        const { id, isDeletable, ...rest } = payload
        payload = rest
      } else {
        payload = { ...data, ...payload }
      }

      const controller = new AbortController()
      axios[type === 'edit' ? 'patch' : 'post'](url, payload, { signal: controller.signal })
        .then((response) => {
          setForm(data)
          onApply(response.data)
          setValidated(false)
          setModalVisible(false)
        })
        .finally(() => isComponentMounted && setLoading(false))

      return () => controller.abort()
    }
  }

  return (
    <>
      {type === 'create' ?
        <CButton className='flex! items-center' onClick={() => setModalVisible(true)}>
          <CIcon size='xl' icon={cilPlus} className='text-white pr-2' />
          Add New User
        </CButton>
      : <CButton color='primary' variant='outline' shape='square' size='sm' onClick={() => setModalVisible(true)}>
          <CIcon icon={cilPencil} />
        </CButton>
      }

      <CModal scrollable visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader style={{ backgroundColor: '#044A89' }} className='text-white text-center'>
          <CModalTitle className='capitalize'>{type} User</CModalTitle>
        </CModalHeader>

        <CForm className='needs-validation' noValidate validated={validated} onSubmit={(e) => onSubmit(e)}>
          <CModalBody>
            <CTooltip content='Field Officer Name' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-endUser-detail-name'>
                  <CIcon icon={cilContact} />
                </CInputGroupText>
                <CFormInput
                  required
                  type='text'
                  placeholder='Field Officer Name'
                  defaultValue={form.name}
                  onChange={(e) => setForm({ name: e.target.value })}
                />
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Contact Number' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-endUser-detail-phonenumber'>
                  <CIcon icon={cilPhone} />
                </CInputGroupText>
                <CFormInput
                  required
                  type='text'
                  placeholder='Contact Number'
                  defaultValue={form.phonenumber}
                  onChange={(e) => setForm({ phonenumber: e.target.value })}
                />
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Email' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-endUser-detail-email'>
                  <CIcon icon={cilEnvelopeClosed} />
                </CInputGroupText>
                <CFormInput
                  required
                  type='text'
                  placeholder='Email'
                  defaultValue={form.email}
                  onChange={(e) => setForm({ email: e.target.value })}
                />
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

ModalEditUser.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    phonenumber: PropTypes.string,
    email: PropTypes.string,
    isDeletable: PropTypes.bool,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['create', 'edit']).isRequired,
}
