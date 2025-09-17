import { Loading } from '@/components/Loading'
import { axios } from '@/utilities/axios-instance'
import { cilList, cilPaperPlane, cilPlant } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CListGroup, CListGroupItem } from '@coreui/react'
import { CButton, CCard, CCol, CFormCheck, CInputGroup, CRow } from '@coreui/react-pro'
import PropTypes from 'prop-types'

export const MapSummary = ({ sumActualPlants, activePlantListIds }) => {
  const date = useDate()
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const controller = new AbortController()

    axios
      .get('/plant-targets', {
        signal: controller.signal,
        params: {
          filter: {
            fields: ['target', 'plantId'],
            include: [
              {
                relation: 'plant',
                scope: { where: { is_active: { eq: true } } },
              },
            ],
          },
        },
      })
      .then(({ data }) => {
        // lb4 cant do nested filter, hence need to filter plant NOT active out

        const _targets = data.filter((i) => i.plant).map(({ plant, ...t }) => ({ ...t }))
        setTargets(_targets)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  const activeSumTargets = useMemo(
    () => targets.filter((t) => activePlantListIds.includes(t.plantId)).reduce((acc, c) => acc + c.target, 0),
    [activePlantListIds, targets],
  )

  if (loading) {
    return <Loading />
  }

  return (
    <CCard className='h-[20vh] flex justify-center rounded-none! px-2 py-4'>
      <CRow className='items-center'>
        <CCol md={4} style={{ paddingLeft: '3%' }}>
          <CCol style={{ fontWeight: 'bold' }}>
            <h2>Carbon Green Shoot</h2>
          </CCol>
          <CCol className='flex gap-2'>
            <div>{date.toDateString()}</div>
            <div>{date.toLocaleTimeString()}</div>
          </CCol>
        </CCol>
        <CCol className='flex flex-col items-center'>
          <h1>{date.getFullYear()}</h1>
          <h5>Year</h5>
        </CCol>
        <CCol className='flex flex-col items-center'>
          <h1>{activeSumTargets.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h1>
          <h5>Target</h5>
        </CCol>
        <CCol className='flex flex-col items-center'>
          <h1>
            {activeSumTargets !== 0 ?
              ((sumActualPlants / activeSumTargets) * 100).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : 'n/a'}{' '}
            {/*({sumActualPlants})*/}
          </h1>
          <h5>Percentage (%)</h5>
        </CCol>
      </CRow>
    </CCard>
  )
}
MapSummary.propTypes = {
  sumActualPlants: PropTypes.number.isRequired,
  activePlantListIds: PropTypes.arrayOf(PropTypes.number).isRequired,
}

export const ListStates = ({ onStateClick, activeStateList }) => {
  const classToClose = 'js-cgss-map-action-states'
  const [showList, setShowList] = useCloseOnClickOutside(classToClose)

  return (
    <div className={classToClose}>
      <CListGroupItem className='w-[40px] absolute! right-[10px] top-[60px] cursor-pointer'>
        <CButton
          className='text-gray-600! hover:text-black! bg-white'
          style={{ borderRadius: '2px' }}
          onClick={() => setShowList(!showList)}>
          <CIcon icon={cilList} />
        </CButton>
      </CListGroupItem>

      {showList ?
        <div className='no-scrollbar shadow-lg absolute top-[60px] right-[55px] rounded z-2 min-w-[200px]'>
          <CListGroup>
            <CListGroupItem active className='text-white'>
              States:
            </CListGroupItem>
            <div className='no-scrollbar overflow-x-hidden overflow-y-auto rounded-br rounded-bl h-[230px]'>
              {statePos.map((item) => (
                <CListGroupItem
                  key={item.state}
                  component='button'
                  onClick={() => onStateClick(item)}
                  className={`${
                    activeStateList === item.state ? 'font-bold' : ''
                  } text-black bg-white hover:!bg-gray-200`}>
                  <div className='flex'>
                    <CCol style={{ minWidth: 'max-content' }}>{item.state}</CCol>
                    <CCol className='flex items-center justify-end'>
                      <CIcon icon={cilPaperPlane} />
                    </CCol>
                  </div>
                </CListGroupItem>
              ))}
            </div>
          </CListGroup>
        </div>
      : null}
    </div>
  )
}
ListStates.propTypes = {
  onStateClick: PropTypes.func.isRequired,
  activeStateList: PropTypes.string.isRequired,
}

export const ListPlants = ({ plantsList, setPlantList }) => {
  const classToClose = 'js-cgss-map-action-plants'
  const [showList, setShowList] = useCloseOnClickOutside(classToClose)

  return (
    <div className={classToClose}>
      <CListGroupItem className='w-[40px] absolute! right-[10px] top-[110px] cursor-pointer'>
        <CButton
          className='text-gray-600! hover:text-black! bg-white'
          style={{ borderRadius: '2px' }}
          onClick={() => setShowList(!showList)}>
          <CIcon icon={cilPlant} />
        </CButton>
      </CListGroupItem>

      {showList ?
        <div className='no-scrollbar shadow-lg absolute top-[110px] right-[55px] rounded z-2 min-w-[200px]'>
          <CListGroup>
            <CListGroupItem active className='text-white'>
              Plants:
            </CListGroupItem>
            <CListGroupItem>
              {plantsList.map((p, index) => (
                <CInputGroup key={index}>
                  <CFormCheck
                    id={p.name}
                    label={p.name}
                    checked={p.isChecked}
                    onChange={(e) => {
                      e.stopPropagation()
                      setPlantList((c) => {
                        c[index].isChecked = e.target.checked
                        return [...c]
                      })
                    }}
                  />
                </CInputGroup>
              ))}
            </CListGroupItem>
          </CListGroup>
        </div>
      : null}
    </div>
  )
}
ListPlants.propTypes = {
  setPlantList: PropTypes.func.isRequired,
  plantsList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      isChecked: PropTypes.bool,
    }),
  ).isRequired,
}

export const statePos = [
  { state: 'Johor', latitude: 1.527549, longitude: 103.745476 },
  { state: 'Kedah', latitude: 5.649718444, longitude: 100.4793343 },
  { state: 'Kelantan', latitude: 6.119973978, longitude: 102.2299768 },
  { state: 'Malacca', latitude: 2.206414407, longitude: 102.2464615 },
  { state: 'Negeri Sembilan', latitude: 2.710492166, longitude: 101.9400203 },
  { state: 'Pahang', latitude: 4.18400112, longitude: 102.0420006 },
  { state: 'Perak', latitude: 4.01185976, longitude: 101.0314453 },
  { state: 'Perlis', latitude: 6.433001991, longitude: 100.1899987 },
  { state: 'Penang', latitude: 5.417071146, longitude: 100.4000109 },
  { state: 'Sabah', latitude: 5.046396097, longitude: 118.3359704 },
  { state: 'Sarawak', latitude: 3.16640749, longitude: 113.0359838 },
  { state: 'Selangor', latitude: 3.066695996, longitude: 101.5499977 },
  { state: 'Terengganu', latitude: 4.233241596, longitude: 103.4478869 },
].sort((a, b) => a.state - b.state)

const useCloseOnClickOutside = (classToClose) => {
  const [showList, setShowList] = useState(false)

  function closeOnClickOutside(e) {
    if (!e.target.closest(`.${classToClose}`) && !showList) {
      setShowList(false)
    }
  }

  useEffect(() => {
    document.body.addEventListener('click', closeOnClickOutside)
    return () => document.body.removeEventListener('click', closeOnClickOutside)
  }, [])

  return [showList, setShowList]
}

const useDate = () => {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const i = setInterval(() => setDate(new Date()), 1000)
    return () => clearInterval(i)
  }, [date])

  return date
}
