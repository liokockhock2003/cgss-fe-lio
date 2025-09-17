import { Loading } from '@/components/Loading'
import { usePlants } from '@/store'
import { axios } from '@/utilities/axios-instance'
import { cn } from '@/utilities/cn'
import { cilPlant } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CBadge, CCloseButton, COffcanvas, COffcanvasBody, COffcanvasHeader, COffcanvasTitle } from '@coreui/react-pro'
import { Circle, GoogleMap, Marker, MarkerClusterer, useJsApiLoader } from '@react-google-maps/api'
import { format } from 'date-fns'
import { isPointWithinRadius } from 'geolib'
import humanFormat from 'human-format'
import { kebabCase } from 'lodash-es'
import { Link } from 'react-router-dom'
import { ListPlants, ListStates, MapSummary } from './PageMapComponents'

const _10kmRadius = 10_000
export function PageMap() {
  const [map, setMap] = useState(null)
  const [zoom, setZoom] = useState(6)
  const [circleMarker, setCircleMarker] = useState(null)
  const [coordinates, setCoordinates] = useState({ lat: 1.563467, lng: 103.613234 })

  const { plants } = usePlants()
  const [loading, setLoading] = useState(false)
  const [plantDetails, setPlantDetails] = useState([])
  const [activeStateList, setActiveStateList] = useState('')
  const [plantsList, setPlantList] = useState(plants.map((i) => ({ id: i.id, name: i.name, isChecked: true })))
  const [visibleOffCanvas, setVisibleOffCanvas] = useState(false)
  const [selectedPlantDetails, setSelectedPlanDetails] = useState([])

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API,
  })

  useEffect(() => {
    setLoading(true)

    const controller = new AbortController()
    const fields = { updatedAt: false, createdAt: false }
    const params = {
      filter: {
        fields,
        include: [
          { relation: 'plantSpecies', scope: { fields } },
          {
            relation: 'plantActual',
            scope: {
              fields,
              include: [
                { relation: 'state', scope: { fields } },
                { relation: 'enduser', scope: { fields } },
                { relation: 'plant', scope: { fields, where: { is_active: { eq: true } } } },
              ],
            },
          },
        ],
      },
    }

    axios
      .get('/plant-actual-details', { params, signal: controller.signal })
      // lb4 cant do nested filter, hence need to filter plant NOT active out
      .then(({ data }) => setPlantDetails(data.filter((i) => i?.plantActual?.plant)))
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  const activePlantListIds = plantsList.filter((i) => i.isChecked).map((i) => i.id)
  const _plantDetails = plantDetails.filter((i) => activePlantListIds.includes(i.plantActual.plantId))
  const sumActualPlants = _plantDetails.map((i) => i.no_of_seedling).reduce((acc, c) => acc + c, 0)

  const onSelectMarker = useCallback((item, zoomLevel) => {
    setZoom(zoomLevel)
    setCoordinates({ lat: item.latitude, lng: item.longitude })
  }, [])

  if (loading || !isLoaded) {
    return <Loading />
  }

  return (
    <div className='rounded overflow-hidden h-full flex flex-col'>
      <MapSummary activePlantListIds={activePlantListIds} sumActualPlants={sumActualPlants} />

      <GoogleMap
        center={coordinates}
        onUnmount={() => setMap(null)}
        onLoad={(map) => {
          setMap(map)
          map.setRestriction({
            strictBounds: true,
            latLngBounds: {
              north: 7.985468614071339,
              south: -0.21668340102317607,
              west: 98.84073425894765,
              east: 120.68106629019765,
            },
          })
        }}
        onDragStart={() => setActiveStateList('')}
        zoom={zoom}
        onZoomChanged={() => map !== null && setZoom(map.zoom)}
        options={{ mapTypeControl: true }}
        mapContainerClassName='flex-1 relative w-100 h-100'>
        <MarkerClusterer maxZoom={11}>
          {(clusterer) => {
            return (
              <>
                {_plantDetails.map((item) => (
                  <Marker
                    key={item.id}
                    visible={zoom > 6}
                    position={{ lat: item.latitude, lng: item.longitude }}
                    clusterer={clusterer}
                    options={{ icon: item?.plantActual?.plant?.icon_path || '/icon_default.png' }}
                    onClick={() => {
                      if (zoom >= 11) {
                        const center = { lat: item.latitude, lng: item.longitude }
                        const filtered = plantDetails.filter((pd) =>
                          isPointWithinRadius(
                            { latitude: item.latitude, longitude: item.longitude },
                            { latitude: pd.latitude, longitude: pd.longitude },
                            _10kmRadius,
                          ),
                        )

                        setSelectedPlanDetails(filtered)
                        setVisibleOffCanvas(true)
                        setCoordinates(center)
                        setCircleMarker({
                          strokeColor: '#044a89',
                          strokeOpacity: 0.8,
                          strokeWeight: 2,
                          fillColor: '#044a8991',
                          fillOpacity: 0.35,
                          radius: _10kmRadius,
                          center,
                        })
                      } else {
                        onSelectMarker(item, 11)
                      }
                    }}
                  />
                ))}
              </>
            )
          }}
        </MarkerClusterer>
        {circleMarker ?
          <Circle options={circleMarker} />
        : null}

        <ListPlants plantsList={plantsList} setPlantList={setPlantList} />
        <ListStates
          activeStateList={activeStateList}
          onStateClick={(item) => {
            onSelectMarker(item, 11)
            setActiveStateList(item.state)
          }}
        />
      </GoogleMap>

      <COffcanvas
        placement='end'
        visible={visibleOffCanvas}
        onHide={() => {
          setVisibleOffCanvas(false)
          setCircleMarker(null)
        }}>
        <COffcanvasHeader>
          <COffcanvasTitle>Within {_10kmRadius / 1000}km: </COffcanvasTitle>
          <CCloseButton
            className='text-reset'
            onClick={() => {
              setVisibleOffCanvas(false)
              setCircleMarker(null)
              setSelectedPlanDetails([])
            }}
          />
        </COffcanvasHeader>
        <COffcanvasBody className='gap-4 flex flex-col'>
          {selectedPlantDetails.map((plant) => (
            <Link
              key={plant.id}
              style={{ color: 'currentColor' }}
              to={`/plant-actual/${kebabCase(plant.plantActual.plant.name)}/${plant.plantActualId}`}
              className={cn(
                'no-underline	relative flex flex-col bg-blue-100 hover:bg-opacity-90 dark:bg-blue-800  dark:text-gray-700 rounded shadow-sm p-2 gap-2',
                coordinates.lat === plant.latitude && coordinates.lng === plant.longitude ?
                  'border-4 border-blue-500'
                : '',
              )}>
              <div className='absolute top-[-15px] left-[5px]'>
                <CBadge color={getBadge(plant.plantActual.status)}>{plant.plantActual.status}</CBadge>
              </div>
              <div className='flex justify-between gap-1 items-center'>
                <div className='flex flex-col gap-1'>
                  <span>
                    {plant.plantActual.plant.name} ({plant.plantSpecies.species_name})
                  </span>
                  <span>{format(new Date(plant.plantActual.date_planted), 'dd-LL-yyyy')}</span>
                  <span>
                    {plant.plantActual.state.state_name}({plant.plantActual.state.location_site})
                  </span>
                </div>
                <div
                  className={cn(
                    `text-3xl font-bold`,
                    coordinates.lat === plant.latitude && coordinates.lng === plant.longitude ? 'text-blue-500' : '',
                  )}>
                  {humanFormat(plant.no_of_seedling)}
                  <CIcon className='text-green-400!' icon={cilPlant} />
                </div>
              </div>
              <div className='bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded p-2'>
                <div className='flex justify-content-between'>
                  <span>{plant.plantActual.enduser.name}</span>
                  <span>{plant.plantActual.enduser.email}</span>
                </div>
                <div className='flex justify-content-between'>{plant.plantActual.enduser.phonenumber}</div>
              </div>
            </Link>
          ))}
        </COffcanvasBody>
      </COffcanvas>
    </div>
  )
}

const getBadge = (status) => {
  return (
    {
      completed: 'success',
      complete: 'success',
      ongoing: 'warning',
    }[status] ?? 'primary'
  )
}
