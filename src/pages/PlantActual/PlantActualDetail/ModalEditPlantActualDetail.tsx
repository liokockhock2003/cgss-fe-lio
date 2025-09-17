import { axios } from '@/utilities/axios-instance.ts'
import { useStateReducer } from '@/utilities/use-state-reducer.ts'
import {
  cilFlower,
  cilFullscreen,
  cilMap,
  cilPencil,
  cilPlus,
  cilResizeHeight,
  cilResizeWidth,
  cilTerrain,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
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
import { transformerPlantActualDetail } from '../helper'

export const ModalEditPlantActualDetail = ({ plantSpecies, type, data, onApply }) => {
  const [form, setForm] = useStateReducer(data)
  const [modalVisible, setModalVisible] = useState(false)
  const [validated, setValidated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = (e) => {
    if (e.currentTarget.checkValidity() === false) {
      e.preventDefault()
      e.stopPropagation()
      setValidated(true)
    } else {
      e.preventDefault()
      setIsSubmitting(true)

      const controller = new AbortController()
      const { height, latitude, longitude, geo_coverage, no_of_seedling, plantSpeciesId } = form
      let url = `/plant-actual-details`

      let payload = {
        height,
        latitude,
        longitude,
        geo_coverage,
        no_of_seedling,
        plantSpeciesId,
        plantActualId: data.plantActualId,
      }

      if (type === 'edit') {
        url += `/${data.id}`
      } else {
        payload = { ...payload }
      }

      axios[type === 'edit' ? 'patch' : 'post'](url, payload, { signal: controller.signal })
        .then((response) => {
          setForm(data)
          setValidated(false)
          setModalVisible(false)
          const id = { create: response.data.id, edit: data.id }[type]

          return axios
            .get(`/plant-actual-details/${id}`, { params: { filter: { include: ['plantSpecies'] } } })
            .then(({ data }) => onApply(transformerPlantActualDetail(data)))
        })
        .finally(() => setIsSubmitting(false))

      return () => controller.abort()
    }
  }

  return (
    <>
      {type === 'create' ?
        <CButton className='bg-white' style={{ color: '#00008B' }} onClick={() => setModalVisible(true)}>
          <CIcon icon={cilPlus} style={{ color: '#00008B', height: '19px', width: '30px' }} />
          Add Tree Species
        </CButton>
      : <CButton color='primary' variant='outline' shape='square' size='sm' onClick={() => setModalVisible(true)}>
          <CIcon icon={cilPencil} />
        </CButton>
      }

      <CModal scrollable visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CForm className='needs-validation' noValidate validated={validated} onSubmit={(e) => onSubmit(e)}>
          <CModalHeader style={{ backgroundColor: '#044A89' }} className='text-white text-center'>
            <CModalTitle>{type === 'create' ? 'Add Tree Species' : 'Edit Species'}</CModalTitle>
          </CModalHeader>

          <CModalBody>
            <CTooltip content='Species' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-plant-actual-detail-species'>
                  <CIcon icon={cilMap} />
                </CInputGroupText>
                <CFormSelect
                  required
                  // defaultValue=""
                  value={form.plantSpeciesId}
                  onChange={(e) => setForm({ plantSpeciesId: +e.target.value })}>
                  <option disabled hidden value=''>
                    Species
                  </option>
                  <GenerateUniqueOptions data={plantSpecies} label='species_name' useValue='id' />
                </CFormSelect>
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Trees Planted' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-plant-actual-detail-no_of_seedling'>
                  <CIcon icon={cilFlower} />
                </CInputGroupText>
                <CFormInput
                  required
                  type='text'
                  placeholder='Trees Planted'
                  defaultValue={form.no_of_seedling}
                  onChange={(e) => setForm({ no_of_seedling: +e.target.value })}
                />
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Average Height' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-plant-actual-detail-height'>
                  <CIcon icon={cilFullscreen} />
                </CInputGroupText>
                <CFormInput
                  required
                  type='text'
                  placeholder='Average Height'
                  defaultValue={form.height}
                  onChange={(e) => setForm({ height: +e.target.value })}
                />
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Latitude' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-plant-actual-detail-latitude'>
                  <CIcon icon={cilResizeWidth} />
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
                <CInputGroupText id='modal-create-plant-actual-detail-longitude'>
                  <CIcon icon={cilResizeHeight} />
                </CInputGroupText>
                <CFormInput
                  required
                  placeholder='longitude'
                  defaultValue={form.longitude}
                  onChange={(e) => setForm({ longitude: +e.target.value })}
                />
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Coverage' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-plant-actual-detail-geo_coverage'>
                  <CIcon icon={cilTerrain} />
                </CInputGroupText>
                <CFormInput
                  type='text'
                  required
                  placeholder='Coverage'
                  defaultValue={form.geo_coverage}
                  onChange={(e) => setForm({ geo_coverage: +e.target.value })}
                />
              </CInputGroup>
            </CTooltip>
          </CModalBody>

          <CModalFooter>
            <CRow>
              <CCol>
                <CLoadingButton
                  type='submit'
                  style={{ backgroundColor: '#044A89', width: '100%' }}
                  loading={isSubmitting}>
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

ModalEditPlantActualDetail.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    geo_coverage: PropTypes.number,
    no_of_seedling: PropTypes.number,

    plantSpeciesId: PropTypes.any,
    plantActualId: PropTypes.number,
  }),
  onApply: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['create', 'edit']).isRequired,
  plantSpecies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      species_name: PropTypes.string,
      local_name: PropTypes.string,
    }),
  ),
}

const GenerateUniqueOptions = ({ data, label, useValue }) => {
  return data.map((item, i) => (
    <option key={i} value={item[useValue]}>
      {item[label]}
    </option>
  ))
}
