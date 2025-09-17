import { axios } from '@/utilities/axios-instance.ts'
import { useIsComponentMounted } from '@/utilities/use-is-component-mounted'
import { useStateReducer } from '@/utilities/use-state-reducer.ts'
import { cilBookmark, cilMap, cilPencil, cilPlus } from '@coreui/icons'
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

export const ModalEditState = ({ type, data, onApply }) => {
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
      let url = `/states`

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
          Add Location
        </CButton>
      : <CButton color='primary' variant='outline' shape='square' size='sm' onClick={() => setModalVisible(true)}>
          <CIcon icon={cilPencil} />
        </CButton>
      }

      <CModal scrollable visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader style={{ backgroundColor: '#044A89' }} className='text-white text-center'>
          <CModalTitle className='capitalize'>{type} State</CModalTitle>
        </CModalHeader>

        <CForm className='needs-validation' noValidate validated={validated} onSubmit={(e) => onSubmit(e)}>
          <CModalBody>
            <CTooltip content='State Name' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-state-detail-state_name'>
                  <CIcon icon={cilMap} />
                </CInputGroupText>
                <CFormInput
                  required
                  type='text'
                  placeholder='State name'
                  defaultValue={form.state_name}
                  onChange={(e) => setForm({ state_name: e.target.value })}
                />
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Location Site' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-state-detail-location_site'>
                  <CIcon icon={cilMap} />
                </CInputGroupText>
                <CFormInput
                  required
                  type='text'
                  placeholder='Location Site'
                  defaultValue={form.location_site}
                  onChange={(e) => setForm({ location_site: e.target.value })}
                />
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Latitude' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-state-detail-latitude'>
                  <CIcon icon={cilBookmark} />
                </CInputGroupText>
                <CFormInput
                  required
                  type='text'
                  placeholder='latitude'
                  defaultValue={form.latitude}
                  onChange={(e) => setForm({ latitude: +e.target.value })}
                />
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Longitude' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-state-detail-longitude'>
                  <CIcon icon={cilBookmark} />
                </CInputGroupText>
                <CFormInput
                  required
                  placeholder='longitude'
                  defaultValue={form.longitude}
                  onChange={(e) => setForm({ longitude: +e.target.value })}
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

ModalEditState.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number,
    state_name: PropTypes.string,
    location_site: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    isDeletable: PropTypes.bool,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['create', 'edit']).isRequired,
}
