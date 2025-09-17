import { Loading } from '@/components/Loading'
import { axios } from '@/utilities/axios-instance'
import { defaultTableStyle } from '@/utilities/default-table-styles'
import { CCard, CCardBody, CCardTitle, CSmartTable } from '@coreui/react-pro'
import { ModalDeleteUser } from './ModalDeleteUser'
import { ModalEditUser } from './ModalEditUser'

export function PageUser() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [_temp, _tempRefetch] = useState(0)

  useEffect(() => {
    setLoading(true)

    const controller = new AbortController()

    axios
      .get('/endusers', { params: { filter: { include: ['plantActuals'] } }, signal: controller.signal })
      .then(({ data: d }) => {
        const transformed = d.map((item) => ({
          id: item.id,
          name: item.name,
          phonenumber: item.phonenumber,
          email: item.email,
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
            <strong>Users</strong>
          </CCardTitle>

          <ModalEditUser
            type='create'
            data={{ name: '', phonenumber: '', email: '' }}
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
                <ModalEditUser type='edit' data={item} onApply={onRefetch} />

                <ModalDeleteUser
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
  { key: 'name', label: 'Field Officer Name' },
  { key: 'phonenumber', label: 'Contact Number' },
  { key: 'email', label: 'Email' },
  { key: 'action', label: '', filter: false, sorter: false },
])
