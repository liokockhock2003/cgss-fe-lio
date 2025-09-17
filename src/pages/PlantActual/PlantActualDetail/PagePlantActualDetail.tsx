import { Loading } from '@/components/Loading'
import { usePlants } from '@/store'
import { axios } from '@/utilities/axios-instance.ts'
import { defaultTableStyle } from '@/utilities/default-table-styles.ts'
import { FormGroup } from '@blueprintjs/core'
import {
  CAlert,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CSmartTable,
} from '@coreui/react-pro'
import { format } from 'date-fns'
import { kebabCase } from 'lodash-es'
import PropTypes from 'prop-types'
import { useNavigate, useParams } from 'react-router-dom'
import { ModalEditPlantActual } from '../ModalEditPlantActual'
import { plantActualFilterRelations, transformerPlantActual, transformerPlantActualDetail } from '../helper'
import { ModalDeletePlantActualDetail } from './ModalDeletePlantActualDetail'
import { ModalEditPlantActualDetail } from './ModalEditPlantActualDetail'

export function PagePlantActualDetail() {
  const navigate = useNavigate()
  const { name, id } = useParams()
  const { plants } = usePlants()

  const [data, setData] = useState({})
  const [data_planted, setDataPlanted] = useState('')

  const [plantActualDetails, setPlantActualDetails] = useState([])
  const [plantSpecies, setPlantSpecies] = useState([])

  const [loading, setLoading] = useState(false)
  const [visibleAlert, setVisibleAlert] = useState(false)
  const currentPlant = plants.find((i) => kebabCase(i.name) === name)

  useEffect(() => {
    setLoading(true)

    const controller = new AbortController()
    Promise.all(
      [
        axios
          .get(`/plant-species`, { params: { filter: { where: { plantId: { eq: currentPlant.id } } } } })
          .then(({ data }) => data),
        axios
          .get(`/plant-actuals/${id}`, { params: { filter: plantActualFilterRelations } })
          .then(({ data }) => transformerPlantActual(data)),
        // .then((data) =>
        //   Promise.resolve({ ...data, date_planted: format(new Date(data.date_planted), 'dd-LL-yyyy') })
        // ),
        axios
          .get(`/plant-actual-details`, {
            params: { filter: { where: { plantActualId: { eq: id } }, include: ['plantSpecies'] } },
          })
          .then(({ data }) => data.map(transformerPlantActualDetail)),
      ],
      { signal: controller.signal },
    )
      .then(([_species, _plantActuals, _plantActualDetails]) => {
        setPlantSpecies(_species)
        setData(_plantActuals)
        setDataPlanted(format(new Date(_plantActuals.date_planted), 'dd-LL-yyyy'))
        setPlantActualDetails(_plantActualDetails)
      })
      .catch(() => navigate(`/plant-actual/${name}`))
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [id, currentPlant.id, navigate, name])

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <CCard className='mb-4'>
        <CCardHeader className='text-white' style={{ backgroundColor: '#044A89' }}>
          <CRow className='flex items-center'>
            <CCol className='text-left' style={{ fontSize: 20 }}>
              <h4 className='mb-0'>Actual Planting Details</h4>
            </CCol>
            <CCol className='text-right'>
              <div className='d-grid gap-2 d-md-flex justify-content-md-end'>
                {data.id && (
                  <ModalEditPlantActual
                    type='edit'
                    data={data}
                    onApply={(updatedData) => {
                      setData(updatedData)
                      setDataPlanted(format(new Date(updatedData.date_planted), 'dd-LL-yyyy'))
                    }}
                  />
                )}
              </div>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          <CCol>
            <CForm>
              <CRow>
                <ShortCut>
                  <CFormLabel>Date Planted</CFormLabel>
                  <CFormInput disabled value={data_planted} />
                </ShortCut>

                <ShortCut>
                  <CFormLabel>Status</CFormLabel>
                  <CFormInput disabled value={data.status} />
                </ShortCut>
              </CRow>

              <CRow>
                <ShortCut>
                  <CFormLabel>State</CFormLabel>
                  <CFormInput id='state_name' disabled value={data.state_name} />
                </ShortCut>

                <ShortCut>
                  <CFormLabel>Name of Location</CFormLabel>
                  <CFormInput disabled value={data.location_site} />
                </ShortCut>
              </CRow>

              <CRow>
                <ShortCut>
                  <CFormLabel>Name of Field Officer</CFormLabel>
                  <CFormInput disabled value={data.name} />
                </ShortCut>
              </CRow>

              <CRow>
                <ShortCut>
                  <CFormLabel>Contact No</CFormLabel>
                  <CFormInput disabled value={data.phonenumber} />
                </ShortCut>

                <ShortCut>
                  <CFormLabel>Email</CFormLabel>
                  <CFormInput disabled value={data.email} />
                </ShortCut>
              </CRow>
            </CForm>
          </CCol>
        </CCardBody>
      </CCard>

      <CAlert visible={visibleAlert} color='success' dismissible>
        Successfully added
      </CAlert>

      <CCard>
        <CCardHeader style={{ backgroundColor: '#044A89', color: 'white' }}>
          <CRow className='flex items-center'>
            <CCol sm='6'>
              <h4 className='mb-0'>{currentPlant.name} Details</h4>
            </CCol>
            <CCol sm='6' className='text-right'>
              <div className='d-grid gap-2 d-md-flex justify-content-md-end'>
                <ModalEditPlantActualDetail
                  type='create'
                  plantSpecies={plantSpecies}
                  data={{
                    height: undefined,
                    latitude: undefined,
                    longitude: undefined,
                    geo_coverage: undefined,
                    no_of_seedling: undefined,
                    plantSpeciesId: '',
                    plantActualId: +id,
                  }}
                  onApply={(nextData) => {
                    setVisibleAlert(true)
                    setPlantActualDetails((c) => [...c, nextData])
                  }}
                />
              </div>
            </CCol>
          </CRow>
        </CCardHeader>

        <CCardBody>
          <CSmartTable
            items={plantActualDetails}
            pagination
            itemsPerPage={3}
            columns={columns}
            tableProps={{ hover: true, striped: true, className: 'smart-table-dark' }}
            scopedColumns={{
              index: (item, index) => <td>{index + 1}</td>,
              show_details: (item) => {
                return (
                  <td className='space-x-2'>
                    <ModalEditPlantActualDetail
                      type='edit'
                      data={item}
                      plantSpecies={plantSpecies}
                      onApply={(updatedData) => {
                        const nextData = plantActualDetails.map((i) =>
                          i.id === updatedData.id ? { ...i, ...updatedData } : i,
                        )

                        setPlantActualDetails(nextData)
                      }}
                    />

                    <ModalDeletePlantActualDetail
                      data={item}
                      onApply={(id) => {
                        setPlantActualDetails(plantActualDetails.filter((i) => i.id !== id))
                      }}
                    />
                  </td>
                )
              },
            }}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

const columns = defaultTableStyle([
  { key: 'index', label: '#' },
  { key: 'species_name', label: 'Species' },
  { key: 'no_of_seedling', label: 'Tree Planted' },
  { key: 'latitude', label: 'Latitude' },
  { key: 'longitude', label: 'Longitude' },
  { key: 'geo_coverage', label: 'Coverage (HA)' },
  { key: 'show_details', label: '', filter: false, sorter: false },
])

const ShortCut = ({ children }) => (
  <CCol>
    <div className='mb-3'>
      <FormGroup>{children}</FormGroup>
    </div>
  </CCol>
)

ShortCut.propTypes = {
  children: PropTypes.any,
}
