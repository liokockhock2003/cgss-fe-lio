import { axios } from '@/utilities/axios-instance'
import { useIsComponentMounted } from '@/utilities/use-is-component-mounted.ts'
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

export const ModalEditPlantCategory = ({ type, data, onApply }) => {
  const isComponentMounted = useIsComponentMounted()

  const [modalVisible, setModalVisible] = useState(false)
  const [validated, setValidated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [inputError, setInputError] = useState(false)

  const onSubmit = (e) => {
    if (e.currentTarget.checkValidity() === false) {
      e.preventDefault()
      e.stopPropagation()
      setValidated(true)
    } else {
      e.preventDefault()
      setLoading(true)
      setInputError(false)
      const formData = new FormData(e.target)
      let payload = Object.fromEntries(formData)
      let url = `/plant-categories`

      if (type === 'edit') {
        url += `/${data.id}`
      } else {
        payload = { ...data, ...payload }
      }

      const controller = new AbortController()
      axios[type === 'edit' ? 'patch' : 'post'](url, payload, { signal: controller.signal })
        .then((response) => {
          onApply(response.data)
          setValidated(false)
          setModalVisible(false)
        })
        .catch(() => setInputError(true))
        .finally(() => isComponentMounted && setLoading(false))

      return () => controller.abort()
    }
  }

  return (
    <>
      {type === 'create' ?
        <CButton className='flex! items-center' onClick={() => setModalVisible(true)}>
          <CIcon size='xl' icon={cilPlus} className='text-white pr-2' />
          Add Plant Category
        </CButton>
      : <CButton color='primary' variant='ghost' size='sm' onClick={() => setModalVisible(true)}>
          <CIcon icon={cilPencil} />
        </CButton>
      }

      <CModal scrollable visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader style={{ backgroundColor: '#044A89' }} className='text-white text-center'>
          <CModalTitle className='capitalize'>{type} Plant Category</CModalTitle>
        </CModalHeader>

        <CForm className='needs-validation' noValidate validated={validated} onSubmit={(e) => onSubmit(e)}>
          <CModalBody>
            <CTooltip content='name' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='inputGroup-sizing-default'>
                  <CIcon icon={cilLeaf} />
                </CInputGroupText>
                <CFormInput
                  type='text'
                  invalid={inputError}
                  feedback='plant category already exist'
                  defaultValue={data.name}
                  name='name'
                  required
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

ModalEditPlantCategory.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
  onApply: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['create', 'edit']).isRequired,
}
