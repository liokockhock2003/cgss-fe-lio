import { usePlants } from '@/store'
import { axios } from '@/utilities/axios-instance'
import { CAlert, CBadge, CButton, CCard, CCardBody, CCardTitle, CSmartTable } from '@coreui/react-pro'
import { format } from 'date-fns'
import { kebabCase } from 'lodash-es'
import { Link, Navigate, Outlet, useMatch, useNavigate, useParams } from 'react-router-dom'
import { ModalDeletePlantActual } from './ModalDeletePlantActual'
import { ModalEditPlantActual } from './ModalEditPlantActual'
import { plantActualFilterRelations, transformerPlantActual } from './helper'

const getPlantActuals = (id) => {
  return axios('/plant-actuals', {
    params: {
      filter: {
        order: 'date_planted DESC',
        where: { plantId: { eq: id } },
        ...plantActualFilterRelations,
      },
    },
  })
    .then(({ data }) => data.map(transformerPlantActual))
    .catch(() => new Error('getPlantActuals error'))
}

export function PagePlantActual() {
  const navigate = useNavigate()
  const { name } = useParams()
  const isCurrentlyPlantActualDetailPage = useMatch('/plant-actual/:name/:id')

  const { plants } = usePlants()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [visibleAlert, setVisibleAlert] = useState(false)
  const currentPlant = plants.find((i) => kebabCase(i.name) === name) ?? { id: '' }

  useEffect(() => {
    setLoading(true)
    getPlantActuals(currentPlant.id)
      .then((d) => setData(d))
      .catch(() => navigate(`dashboard`))
      .finally(() => setLoading(false))
  }, [currentPlant.id, navigate, isCurrentlyPlantActualDetailPage])

  // validation in case someone enter non-exist plant
  if (!plants.some((i) => kebabCase(i.name) === name)) {
    return <Navigate to='/dashboard' replace />
  }

  // to support breadcrumb
  if (isCurrentlyPlantActualDetailPage) {
    return <Outlet />
  }

  return (
    <>
      <CAlert visible={visibleAlert} color='success' dismissible>
        Successfully added
      </CAlert>
      <CCard>
        <div className='p-4 space-y-3 flex-1'>
          <div className='flex justify-between'>
            <CCardTitle className='capitalize text-4xl font-normal'>
              <strong>{name} Actual Plants</strong>
            </CCardTitle>

            <ModalEditPlantActual
              type='create'
              data={{
                state_name: '',
                location_site: '',
                name: '',
                email: '',
                phonenumber: '',
                status: '',
                date_planted: '',
                enduserId: undefined,
                stateId: undefined,
                plantId: currentPlant.id,
              }}
              onApply={(next) => {
                setData((p) =>
                  [...p, next]
                    .sort((a, b) => Number(new Date(a.date_planted)) - Number(new Date(b.date_planted)))
                    .reverse(),
                )
                setVisibleAlert(true)
              }}
            />
          </div>
        </div>

        <CCardBody>
          <CSmartTable
            columnFilter
            items={data}
            loading={loading}
            pagination
            columns={columns}
            tableProps={{ hover: true, striped: true, className: 'smart-table-dark' }}
            scopedColumns={{
              index: (item, index) => <td>{index + 1}</td>,
              status: (item) => (
                <td>
                  <CBadge color={getBadge(item.status)}>{item.status}</CBadge>
                </td>
              ),
              date_planted: (item) => <td>{format(new Date(item.date_planted), 'dd-LL-yyyy')}</td>,
              show_details: (item) => (
                <td>
                  <div className='flex gap-1.5'>
                    <Link to={`./${item.id}`}>
                      <CButton className='w-full h-full' color='primary' variant='outline' shape='square' size='sm'>
                        <svg width='16' height='16' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            fill='#044a89'
                            fillRule='evenodd'
                            clipRule='evenodd'
                            d='M10 7C8.34315 7 7 8.34315 7 10C7 11.6569 8.34315 13 10 13C11.6569 13 13 11.6569 13 10C13 8.34315 11.6569 7 10 7ZM9 10C9 9.44772 9.44771 9 10 9C10.5523 9 11 9.44772 11 10C11 10.5523 10.5523 11 10 11C9.44771 11 9 10.5523 9 10Z'
                          />
                          <path
                            fill='#044a89'
                            fillRule='evenodd'
                            clipRule='evenodd'
                            d='M10 4C7.56957 4 5.37392 4.82263 3.77481 5.92721C2.97476 6.47983 2.30037 7.11926 1.81702 7.79086C1.3431 8.44937 1 9.2145 1 10C1 10.7855 1.3431 11.5506 1.81702 12.2091C2.30037 12.8807 2.97476 13.5202 3.77481 14.0728C5.37392 15.1774 7.56957 16 10 16C12.4304 16 14.6261 15.1774 16.2252 14.0728C17.0252 13.5202 17.6996 12.8807 18.183 12.2091C18.6569 11.5506 19 10.7855 19 10C19 9.2145 18.6569 8.44937 18.183 7.79086C17.6996 7.11926 17.0252 6.47983 16.2252 5.92721C14.6261 4.82263 12.4304 4 10 4ZM3 10C3 9.7855 3.10461 9.42563 3.44034 8.95914C3.76664 8.50574 4.26382 8.02017 4.91149 7.57279C6.20781 6.67737 8.01215 6 10 6C11.9879 6 13.7922 6.67737 15.0885 7.57279C15.7362 8.02017 16.2334 8.50574 16.5597 8.95914C16.8954 9.42563 17 9.7855 17 10C17 10.2145 16.8954 10.5744 16.5597 11.0409C16.2334 11.4943 15.7362 11.9798 15.0885 12.4272C13.7922 13.3226 11.9879 14 10 14C8.01215 14 6.20781 13.3226 4.91149 12.4272C4.26382 11.9798 3.76664 11.4943 3.44034 11.0409C3.10461 10.5744 3 10.2145 3 10Z'
                          />
                        </svg>
                      </CButton>
                    </Link>

                    <ModalDeletePlantActual
                      data={item}
                      onApply={(id) => {
                        setData(data.filter((i) => i.id !== id))
                      }}
                    />
                  </div>
                </td>
              ),
            }}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

const tableStyling = () => ({
  _style: { backgroundColor: '#044A89', color: 'white' },
  _props: { color: 'primary', className: 'fw-semibold' },
})

const columns = [
  { key: 'state_name', label: 'State', ...tableStyling() },
  { key: 'location_site', label: 'Location', ...tableStyling() },
  { key: 'date_planted', label: 'Date Planted', ...tableStyling() },
  { key: 'name', label: 'Officer Name', ...tableStyling() },
  { key: 'email', label: 'Name', ...tableStyling() },
  { key: 'totalNoOfSeedling', label: 'Trees Planted', ...tableStyling() },
  { key: 'species', label: 'Species', ...tableStyling() },
  { key: 'status', label: 'status', ...tableStyling() },
  { key: 'show_details', label: '', filter: false, sorter: false, ...tableStyling() },
]

const getBadge = (status) => {
  return (
    {
      completed: 'success',
      ongoing: 'warning',
    }[status] ?? 'primary'
  )
}
