import { axios } from '@/utilities/axios-instance'
import { cilLeaf, cilPencil, cilPlus, cilTag } from '@coreui/icons'
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

export const ModalEditPlantSpecies = ({ type, data, onApply }) => {
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
      let url = `/plant-species`

      if (type === 'edit') {
        url += `/${data.id}`
      } else {
        payload = { ...payload, plantId: data.plantId }
      }

      axios[type === 'edit' ? 'patch' : 'post'](url, payload)
        .then((response) => {
          onApply(data.id ? { ...data, ...payload } : response.data)
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
          <CIcon size='xl' icon={cilPlus} className='text-white pr-2' />
          Add Species
        </CButton>
      : <CButton color='primary' variant='outline' shape='square' size='sm' onClick={() => setModalVisible(true)}>
          <CIcon icon={cilPencil} />
        </CButton>
      }

      <CModal scrollable visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader style={{ backgroundColor: '#044A89' }} className='text-white text-center'>
          <CModalTitle className='capitalize'>{type} Species</CModalTitle>
        </CModalHeader>

        <CForm className='needs-validation' noValidate validated={validated} onSubmit={(e) => onSubmit(e)}>
          <CModalBody>
            <CTooltip content='Dominant Species' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='inputGroup-sizing-default'>
                  <CIcon icon={cilLeaf} />
                </CInputGroupText>
                <CFormInput type='text' defaultValue={data.species_name} name='species_name' required />
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Local Name' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='inputGroup-sizing-default'>
                  <CIcon icon={cilTag} />
                </CInputGroupText>
                <CFormInput type='text' defaultValue={data.local_name} name='local_name' required />
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

ModalEditPlantSpecies.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number,
    plantId: PropTypes.number,
    species_name: PropTypes.string,
    local_name: PropTypes.string,
  }),
  onApply: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['create', 'edit']).isRequired,
}
