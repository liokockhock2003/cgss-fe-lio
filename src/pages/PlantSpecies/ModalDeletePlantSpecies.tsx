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

export const ModalDeletePlantSpecies = ({ label, data, onApply }) => {
  const isComponentMounted = useIsComponentMounted()

  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const onDelete = () => {
    setLoading(true)

    axios
      .delete(`plant-species/${data.id}`)
      .then(() => {
        onApply()
      })
      .finally(() => isComponentMounted && setLoading(false))
  }

  return (
    <>
      <CButton
        className={data.isDeletable ? 'visible' : 'invisible'}
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
          <CModalTitle>Delete Species</CModalTitle>
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

ModalDeletePlantSpecies.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number,
    isDeletable: PropTypes.bool,
    species_name: PropTypes.string,
    local_name: PropTypes.string,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
}
