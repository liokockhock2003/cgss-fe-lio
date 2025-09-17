import { axios } from '@/utilities/axios-instance'
import { useIsComponentMounted } from '@/utilities/use-is-component-mounted.ts'
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

export const ModalDeletePlant = ({ label, data, onApply }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const isComponentMounted = useIsComponentMounted()

  const onDelete = () => {
    setLoading(true)

    const controller = new AbortController()
    axios
      .delete(`plants/${data.id}`, { signal: controller.signal })
      .then(() => {
        onApply(data.id)
        setModalVisible(false)
      })
      .finally(() => isComponentMounted && setLoading(false))

    return () => controller.abort()
  }

  return (
    <>
      <CButton
        className={data.isDeletable ? '' : 'opacity-30!'}
        disabled={!data.isDeletable}
        color='primary'
        variant='outline'
        shape='square'
        size='sm'
        onClick={() => {
          if (!data.isDeletable) return
          setModalVisible(true)
        }}>
        <CIcon icon={cilTrash} />
      </CButton>

      <CModal scrollable visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader className='text-white text-center' style={{ backgroundColor: '#044A89' }}>
          <CModalTitle>Delete Plant</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol>
              <h4 className='tbl' style={{ fontSize: '16px', fontWeight: '400' }}>
                Are you sure to delete <b>{data[label]}</b>?
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

ModalDeletePlant.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    icon_path: PropTypes.string,
    is_active: PropTypes.bool,
    isDeletable: PropTypes.bool,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
}
