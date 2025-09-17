import { axios } from '@/utilities/axios-instance'
import { useIsComponentMounted } from '@/utilities/use-is-component-mounted.ts'
import {
  CButton,
  CCol,
  CFormSwitch,
  CLoadingButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react-pro'
import PropTypes from 'prop-types'

export const ModalToggleActivePlant = ({ label, data, onApply, disabledCheck }) => {
  const ref = useRef(undefined)
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nextChecked, setNextChecked] = useState(false)
  const isComponentMounted = useIsComponentMounted()

  const onToggleActive = () => {
    setLoading(true)
    setModalVisible(false)

    const controller = new AbortController()
    axios
      .patch(`/plants/${data.id}/is-active`, { is_active: nextChecked }, { signal: controller.signal })
      .then((response) => {
        onApply(response.data)
        setModalVisible(false)

        if (ref.current) {
          ref.current.checked = nextChecked
        }
      })
      .finally(() => isComponentMounted.current && setLoading(false))

    return () => controller.abort()
  }

  return (
    <>
      <CFormSwitch
        ref={ref}
        size='lg'
        className={`${disabledCheck ? 'cursor-not-allowed' : '*:cursor-pointer'}`}
        disabled={disabledCheck}
        id={`is_active-${data.id}`}
        defaultChecked={data.is_active}
        onChange={(e) => {
          e.preventDefault()
          setNextChecked(e.target.checked)
          setModalVisible((b) => !b)
          return false
        }}
      />

      <CModal scrollable visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader className='text-white text-center' style={{ backgroundColor: '#044A89' }}>
          <CModalTitle>Toggle Active or in-active</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol>
              <h4 className='tbl' style={{ fontSize: '16px', fontWeight: '400' }}>
                Are you sure to set <b>{data[label]}</b> to {nextChecked ? '' : 'in-'}active?
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
            onClick={onToggleActive}>
            Yes
          </CLoadingButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

ModalToggleActivePlant.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    icon_path: PropTypes.string,
    is_active: PropTypes.bool,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  disabledCheck: PropTypes.bool.isRequired,
}
