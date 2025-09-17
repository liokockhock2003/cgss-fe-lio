import { Loading } from '@/components/Loading'
import { usePlants } from '@/store'
import { axios } from '@/utilities/axios-instance'
import { CAlert, CCard, CCardBody, CCardTitle, CSmartTable } from '@coreui/react-pro'
import { kebabCase } from 'lodash-es'
import PropTypes from 'prop-types'
import { Navigate, useParams } from 'react-router-dom'
import { ModalDeletePlantSpecies } from './ModalDeletePlantSpecies'
import { ModalEditPlantSpecies } from './ModalEditPlantSpecies'

export function PagePlantSpecies() {
  const { name } = useParams()
  const { plants } = usePlants()

  // validation in case someone enter non-exist plant
  if (!plants.some((i) => kebabCase(i.name) === name)) {
    return <Navigate to='/dashboard' replace />
  }

  const currentPlant = plants.find((i) => kebabCase(i.name) === name)
  return <PlantSpecies currentPlant={currentPlant} plants={plants} />
}

function PlantSpecies({ currentPlant, plants }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isAlertVisible, setIsAlertVisible] = useState(false)

  useEffect(() => {
    const filter = {
      where: { plantId: { eq: currentPlant.id } },
      fields: { id: true, species_name: true, local_name: true },
      include: ['plantActualDetails'],
    }

    setLoading(true)
    const controller = new AbortController()
    axios('/plant-species', { params: { filter } }, { signal: controller.signal })
      .then(({ data: d }) => {
        const transformed = d.map((item) => ({ ...item, isDeletable: !item?.plantActualDetails }))
        setData(transformed)
      })
      .finally(() => setLoading(false))
  }, [currentPlant.id])

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <CAlert visible={isAlertVisible} color='success' dismissible>
        Successfully added
      </CAlert>
      <CCard>
        <div className='p-4 space-y-3 flex-1'>
          <div className='flex justify-between'>
            <CCardTitle className='text-4xl font-normal'>
              <strong>{currentPlant.name} Species</strong>
            </CCardTitle>

            <ModalEditPlantSpecies
              data={{ plantId: currentPlant.id, isDeletable: false, local_name: '', species_name: '' }}
              type='create'
              onApply={(data) => {
                setData((c) => [...c, { ...data, isDeletable: true }])
                setIsAlertVisible(true)
              }}
            />
          </div>
        </div>

        <CCardBody>
          <CSmartTable
            columnFilter
            items={data}
            pagination
            loading={loading}
            columns={columns}
            tableProps={{ hover: true, striped: true, className: 'smart-table-dark' }}
            scopedColumns={{
              index: (item, index) => <td>{index + 1}</td>,
              show_details: (item) => (
                <td className='justify-center flex gap-2'>
                  <ModalEditPlantSpecies
                    type='edit'
                    data={item}
                    onApply={(nextData) => {
                      setData((c) => c.map((_data) => (_data.id === nextData.id ? nextData : _data)))
                    }}
                  />

                  <ModalDeletePlantSpecies
                    data={item}
                    label='species_name'
                    onApply={() => {
                      setData((c) => c.filter((_data) => _data.id !== item.id))
                    }}
                  />
                </td>
              ),
            }}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

PlantSpecies.propTypes = {
  plants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      species_name: PropTypes.string,
      local_name: PropTypes.string,
    }),
  ),
  currentPlant: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
}

const columns = [
  {
    key: 'index',
    label: '#',
    filter: false,
    sorter: false,
    _style: { width: '10%', backgroundColor: '#044A89', color: 'white' },
    _props: { color: 'primary', className: 'fw-semibold' },
  },
  {
    key: 'species_name',
    label: 'Dominant Species',
    _style: { width: '25%', backgroundColor: '#044A89', color: 'white' },
    _props: { color: 'primary', className: 'fw-semibold' },
  },
  {
    key: 'local_name',
    label: 'Local Name',
    _style: { width: '25%', backgroundColor: '#044A89', color: 'white' },
    _props: { color: 'primary', className: 'fw-semibold' },
  },
  {
    key: 'show_details',
    label: '',
    _style: { width: '10%', backgroundColor: '#044A89', color: 'white' },
    filter: false,
    sorter: false,
    _props: { color: 'primary', className: 'fw-semibold' },
  },
]
