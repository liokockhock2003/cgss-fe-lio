import { Loading } from '@/components/Loading'
import { axios } from '@/utilities/axios-instance'
import { useIsComponentMounted } from '@/utilities/use-is-component-mounted'
import { CLink, CSmartTable } from '@coreui/react-pro'
import PropTypes from 'prop-types'
import { ModalDeleteUrl } from './ModalDeleteUrl'
import { ModalEditUrl } from './ModalEditUrl'

export function PlantLink({ currentPlant }) {
  const [dataUrls, setDataUrls] = useState([])
  const [loading, setLoading] = useState(false)
  const isComponentMounted = useIsComponentMounted()

  useEffect(() => {
    setLoading(true)

    axios
      .get('/plant-urls', {
        params: { filter: { where: { plantId: { eq: currentPlant.id } } } },
      })
      .then(({ data: url }) => {
        setDataUrls(url)
      })
      .finally(() => {
        if (isComponentMounted.current) setLoading(false)
      })
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <CSmartTable
        items={dataUrls}
        pagination
        columns={[
          {
            key: 'index',
            label: 'No',
            _style: {
              width: '10%',
              backgroundColor: '#044A89',
              color: 'white',
              _props: { color: 'primary', className: 'fw-semibold' },
            },
          },
          {
            key: 'url',
            label: 'URL',
            _style: { width: '70%', backgroundColor: '#044A89', color: 'white' },
            _props: { color: 'primary', className: 'fw-semibold' },
          },
          {
            key: 'action',
            label: (
              <ModalEditUrl
                type='create'
                data={{ url: '', plantId: currentPlant.id }}
                onApply={(d) => {
                  setDataUrls((c) => [...c, d])
                }}
              />
            ),
            _style: { backgroundColor: '#044A89', color: 'white', display: 'flex', justifyContent: 'center' },
            _props: { color: 'primary', className: 'fw-semibold' },
          },
        ]}
        itemsPerPage={3}
        tableProps={{ hover: true, striped: true, className: 'smart-table-dark' }}
        scopedColumns={{
          index: (_, index) => <td>{index + 1}</td>,
          url: (item) => (
            <td>
              <CLink className='cursor-pointer' onClick={() => window.open(item.url)}>
                {item.url}
              </CLink>
            </td>
          ),
          action: (item) => (
            <td className='space-x-1.5'>
              <ModalEditUrl
                type='edit'
                data={item}
                onApply={(updatedUrl) => {
                  setDataUrls((c) => c.map((url) => (url.id === updatedUrl.id ? updatedUrl : url)))
                }}
              />
              <ModalDeleteUrl
                data={item}
                onApply={(deleteId) => {
                  setDataUrls((c) => c.filter((url) => url.id !== deleteId))
                }}
              />
            </td>
          ),
        }}
      />
    </>
  )
}

PlantLink.propTypes = {
  currentPlant: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
}
