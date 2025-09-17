import { axios } from '@/utilities/axios-instance'
import { cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CLoadingButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react-pro'
import PropTypes from 'prop-types'

export const ModalDeleteUrl = ({ data, onApply }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const onDelete = () => {
    setLoading(true)

    const controller = new AbortController()
    axios
      .delete(`/plant-urls/${data.id}`, { signal: controller.signal })
      .then(() => {
        onApply(data.id)
        setModalVisible(false)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }

  return (
    <>
      <CButton
        color='primary'
        variant='outline'
        shape='square'
        size='sm'
        onClick={() => {
          setModalVisible(true)
        }}>
        <CIcon icon={cilTrash} />
      </CButton>

      <CModal scrollable visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader className='text-white text-center' style={{ backgroundColor: '#044A89' }}>
          <CModalTitle>Delete Actual Plant</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol>
              <h4 className='tbl' style={{ fontSize: '16px', fontWeight: '400' }}>
                Are you sure to delete this actual plant and all its details?
              </h4>
            </CCol>
          </CRow>
        </CModalBody>

        <CModalFooter>
          <CButton color='secondary' onClick={() => setModalVisible(false)}>
            Cancel
          </CButton>
          <CLoadingButton
            className='text-white'
            type='submit'
            style={{ backgroundColor: '#044A89' }}
            loading={loading}
            onClick={onDelete}>
            Yes, Delete
          </CLoadingButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

ModalDeleteUrl.propTypes = {
  data: PropTypes.shape({ id: PropTypes.number }).isRequired,
  onApply: PropTypes.func.isRequired,
}
