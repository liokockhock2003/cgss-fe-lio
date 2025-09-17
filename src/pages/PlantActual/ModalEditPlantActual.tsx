import { axios } from '@/utilities/axios-instance.ts'
import { useStateReducer } from '@/utilities/use-state-reducer.ts'
import {
  cilChartLine,
  cilContact,
  cilEnvelopeClosed,
  cilLocationPin,
  cilMap,
  cilPencil,
  cilPhone,
  cilPlus,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CDatePicker,
  CForm,
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
import { formatISO } from 'date-fns'
import PropTypes from 'prop-types'
import { plantActualFilterRelations, transformerPlantActual } from './helper'

export const ModalEditPlantActual = ({ type, onApply, data }) => {
  const [form, setForm] = useStateReducer(data)
  const [modalVisible, setModalVisible] = useState(false)
  const [validated, setValidated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [states, setStates] = useState([])
  const [locationSites, setLocationSites] = useState([])
  const [endUsers, setEndUsers] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    Promise.all(
      [
        axios('/states'),
        axios('/endusers', {
          params: { filter: { fields: { id: true, email: true, name: true, phonenumber: true } } },
        }),
      ],
      { signal: controller.signal },
    ).then(([{ data: states }, { data: endUsers }]) => {
      setStates(states)
      setLocationSites(form.state_name ? states.filter((i) => i.state_name === form.state_name) : [])
      setEndUsers(endUsers)
    })

    return () => controller.abort()
  }, [])

  const onSubmit = (e) => {
    if (e.currentTarget.checkValidity() === false) {
      e.preventDefault()
      e.stopPropagation()
      setValidated(true)
    } else {
      e.preventDefault()
      setIsSubmitting(true)

      const controller = new AbortController()
      const { status, date_planted, stateId, enduserId } = form
      let url = `/plant-actuals`
      let payload = {
        status,
        stateId,
        enduserId,
        plantId: data.plantId,
        date_planted: formatISO(new Date(date_planted)),
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
            .get(`/plant-actuals/${id}`, { params: { filter: plantActualFilterRelations } })
            .then(({ data }) => onApply(transformerPlantActual(data)))
        })
        .finally(() => setIsSubmitting(false))

      return () => controller.abort()
    }
  }

  return (
    <>
      {type === 'create' ?
        <CButton className='flex! items-center' onClick={() => setModalVisible(true)}>
          <CIcon size='xl' icon={cilPlus} className='text-white pr-2' />
          Add Actual Planting
        </CButton>
      : <CButton className='bg-white' style={{ color: '#00008B' }} onClick={() => setModalVisible(true)}>
          <CIcon icon={cilPencil} /> Edit
        </CButton>
      }

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CForm className='needs-validation' noValidate validated={validated} onSubmit={(e) => onSubmit(e)}>
          <CModalHeader style={{ backgroundColor: '#044A89' }} className='text-white text-center'>
            <CModalTitle>{type === 'create' ? 'Create' : 'Edit'} Actual Plant</CModalTitle>
          </CModalHeader>

          <CModalBody>
            <CTooltip content='State' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-plant-actual-state_name'>
                  <CIcon icon={cilMap} />
                </CInputGroupText>
                <CFormSelect
                  required
                  value={form.state_name}
                  onChange={(e) => {
                    const { state_name, location_site, id } = states.find((i) => i.state_name === e.target.value)

                    setForm({ state_name, location_site, stateId: id })
                    setLocationSites(states.filter((i) => i.state_name === state_name))
                  }}>
                  <option disabled hidden value=''>
                    State
                  </option>
                  <GenerateUniqueOptions data={states} label='state_name' />
                </CFormSelect>
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Location' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-plant-actual-location_site'>
                  <CIcon icon={cilLocationPin} />
                </CInputGroupText>
                <CFormSelect
                  disabled={!form.state_name}
                  value={form.location_site}
                  required
                  onChange={(e) => {
                    const { state_name, location_site, id } = states.find((i) => i.location_site === e.target.value)
                    setForm({ state_name, location_site, stateId: id })
                  }}>
                  <option disabled hidden value=''>
                    Location
                  </option>
                  <GenerateUniqueOptions data={locationSites} label='location_site' />
                </CFormSelect>
              </CInputGroup>
            </CTooltip>

            {/* .modal-dialog-scrollable .modal-content unset overflow */}
            {/* .modal-dialog-scrollable .modal-body unset overflow */}
            <CTooltip content='Date Planted' placement='bottom'>
              <CDatePicker
                date={form.date_planted}
                required
                onDateChange={(e) => setForm({ date_planted: e })}
                locale='en-MY'
              />
            </CTooltip>
            <div className='mb-3'></div>

            <CTooltip content='Email' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-plant-actual-enduser_email'>
                  <CIcon icon={cilEnvelopeClosed} />
                </CInputGroupText>
                <CFormSelect
                  required
                  value={form.email}
                  onChange={(e) => {
                    const { phonenumber, name, email, id } = endUsers.find((i) => i.email === e.target.value)
                    setForm({ phonenumber, name, email, enduserId: id })
                  }}>
                  <option disabled hidden value={''}>
                    Email
                  </option>
                  <GenerateUniqueOptions data={endUsers} label='email' />
                </CFormSelect>
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Name of Field Officer' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-plant-actual-enduser_name'>
                  <CIcon icon={cilContact} />
                </CInputGroupText>
                <CFormSelect
                  required
                  value={form.name}
                  onChange={(e) => {
                    const { phonenumber, name, email, id } = endUsers.find((i) => i.name === e.target.value)
                    setForm({ phonenumber, name, email, enduserId: id })
                  }}>
                  <option disabled hidden value={''}>
                    Name of Field Officer
                  </option>
                  <GenerateUniqueOptions data={endUsers} label='name' />
                </CFormSelect>
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Contact' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-plant-actual-enduser_contact'>
                  <CIcon icon={cilPhone} />
                </CInputGroupText>
                <CFormSelect
                  required
                  value={form.phonenumber}
                  onChange={(e) => {
                    const { phonenumber, name, email, id } = endUsers.find((i) => i.phonenumber === e.target.value)
                    setForm({ phonenumber, name, email, enduserId: id })
                  }}>
                  <option disabled hidden value={''}>
                    Contact
                  </option>
                  <GenerateUniqueOptions data={endUsers} label='phonenumber' />
                </CFormSelect>
              </CInputGroup>
            </CTooltip>

            <CTooltip content='Status' placement='bottom'>
              <CInputGroup className='mb-3'>
                <CInputGroupText id='modal-create-plant-actual-status'>
                  <CIcon icon={cilChartLine} />
                </CInputGroupText>
                <CFormSelect required value={form.status} onChange={(e) => setForm({ status: e.target.value })}>
                  <option disabled hidden value={''}>
                    Status
                  </option>
                  <option key={1} value='ongoing'>
                    ongoing
                  </option>
                  <option key={2} value='completed'>
                    completed
                  </option>
                </CFormSelect>
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

ModalEditPlantActual.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number,
    state_name: PropTypes.string,
    location_site: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    date_planted: PropTypes.string,
    phonenumber: PropTypes.string,
    status: PropTypes.string,
    plantId: PropTypes.number,
    enduserId: PropTypes.number,
    stateId: PropTypes.number,
  }),
  onApply: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['create', 'edit']).isRequired,
}

const GenerateUniqueOptions = ({ data, label }) => {
  const arr = uniqueListBy(data, label).sort()

  return arr.map((item, i) => (
    <option key={i} value={item}>
      {item}
    </option>
  ))
}

const uniqueListBy = (arr, key) => [...new Set(arr.map((i) => i[key]))]
