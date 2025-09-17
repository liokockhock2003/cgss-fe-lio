import { Loading } from '@/components/Loading'
import { axios } from '@/utilities/axios-instance'
import { defaultTableStyle } from '@/utilities/default-table-styles'
import { CCard, CCardBody, CCardTitle, CSmartTable } from '@coreui/react-pro'
import { ModalDeleteState } from './ModalDeleteState'
import { ModalEditState } from './ModalEditState'

export function PageState() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [_temp, _tempRefetch] = useState(0)

  useEffect(() => {
    setLoading(true)

    const controller = new AbortController()

    axios
      .get('/states', { params: { filter: { include: ['plantActuals'] } }, signal: controller.signal })
      .then(({ data: d }) => {
        const transformed = d.map((item) => ({
          id: item.id,
          state_name: item.state_name,
          location_site: item.location_site,
          latitude: item.latitude,
          longitude: item.longitude,
          isDeletable: !((item?.plantActuals ?? []).length > 0),
        }))

        setData(transformed)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [_temp])

  function onRefetch() {
    _tempRefetch(Math.random())
  }

  if (loading) {
    return <Loading />
  }

  return (
    <CCard>
      <div className='p-4 space-y-3 flex-1'>
        <div className='flex justify-between'>
          <CCardTitle className='text-4xl font-normal'>
            <strong>States</strong>
          </CCardTitle>

          <ModalEditState
            type='create'
            data={{ state_name: '', location_site: '', latitude: 0, longitude: 0 }}
            onApply={(newData) => setData([...data, { ...newData, isDeletable: true }])}
          />
        </div>
      </div>

      <CCardBody>
        <CSmartTable
          columnFilter
          items={data}
          pagination
          columns={columns}
          tableProps={{ hover: true, striped: true, className: 'smart-table-dark' }}
          scopedColumns={{
            index: (item, index) => <td>{index + 1}</td>,
            action: (item) => (
              <td className='justify-center flex gap-2'>
                <ModalEditState type='edit' data={item} onApply={onRefetch} />

                <ModalDeleteState
                  data={item}
                  label='name'
                  onApply={() => setData(data.filter((i) => i.id !== item.id))}
                />
              </td>
            ),
          }}
        />
      </CCardBody>
    </CCard>
  )
}

const columns = defaultTableStyle([
  { key: 'index', label: '#', filter: false, sorter: false },
  { key: 'state_name', label: 'State' },
  { key: 'location_site', label: 'Location' },
  { key: 'latitude', label: 'Latitude' },
  { key: 'longitude', label: 'Longitude' },
  { key: 'action', label: '', filter: false, sorter: false },
])
