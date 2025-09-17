import { axios } from '@/utilities/axios-instance.ts'
import { useStateReducer } from '@/utilities/use-state-reducer.ts'
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
import { omit, sumBy } from 'lodash-es'
import PropTypes from 'prop-types'
import { transform } from './helper'

export const ModalEditParameter = ({ data, tableData, plantGrowthId, onApply }) => {
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

      const url = `/plant-growth-rates/${plantGrowthId ?? ''}`
      let avg_co2_absorption = 0
      if (plantGrowthId) {
        const nextTableData = transform(tableData, form)
        avg_co2_absorption =
          sumBy(nextTableData, 'yearly_co2_absorption') / ((nextTableData.length === 1 ? 2 : nextTableData.length) - 1)
      }

      const payload = { ...form, ...(plantGrowthId ? { avg_co2_absorption } : {}) }

      axios[plantGrowthId ? 'patch' : 'post'](url, omit(payload, 'id'))
        .then((response) => {
          const { createdAt, updatedAt, details, ...rest } = response.data

          onApply(plantGrowthId ? form : rest)
          setForm(plantGrowthId ? form : rest)
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
      <CButton className='flex! items-center mt-auto justify-center' onClick={() => setModalVisible(true)}>
        <CIcon size='xl' icon={data.id ? cilPencil : cilPlus} className='text-white dark:text-white-300 pr-2' />
        {plantGrowthId ? 'Update' : 'Create'} CF and R
      </CButton>

      <CModal scrollable visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader style={{ backgroundColor: '#044A89' }} className='text-white text-center'>
          <CModalTitle className='capitalize'>{plantGrowthId ? 'Edit' : 'Create'} Plant CF and R</CModalTitle>
        </CModalHeader>

        <CForm className='needs-validation' noValidate validated={validated} onSubmit={(e) => onSubmit(e)}>
          <CModalBody>
            <CTooltip content='Carbon Fraction' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='inputGroup-sizing-default'>
                  <CIcon icon={cilLeaf} />
                </CInputGroupText>
                <CFormInput
                  required
                  type='number'
                  name='carbon_fraction'
                  value={form.carbon_fraction || 0}
                  onChange={(e) => {
                    setForm({ carbon_fraction: e.target.valueAsNumber })
                  }}
                />
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Ratio' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='inputGroup-sizing-default'>
                  <CIcon icon={cilLeaf} />
                </CInputGroupText>
                <CFormInput
                  name='ratio'
                  required
                  type='number'
                  value={form.ratio || 0}
                  onChange={(e) => {
                    setForm({ ratio: e.target.valueAsNumber })
                  }}
                />
              </CInputGroup>
            </CTooltip>
          </CModalBody>
          <CModalFooter>
            <CRow>
              <CCol>
                <CLoadingButton type='submit' style={{ backgroundColor: '#044A89', width: '100%' }} loading={loading}>
                  {plantGrowthId ? 'Save changes' : 'Create'}
                </CLoadingButton>
              </CCol>
            </CRow>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

ModalEditParameter.propTypes = {
  tableData: PropTypes.any,
  data: PropTypes.shape({
    id: PropTypes.number,
    ratio: PropTypes.number,
    carbon_fraction: PropTypes.number,
    plantId: PropTypes.number,
  }),
  onApply: PropTypes.func.isRequired,
  plantGrowthId: PropTypes.number,
}
