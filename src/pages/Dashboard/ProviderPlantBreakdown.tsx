import { axios } from '@/utilities/axios-instance'
import PropTypes from 'prop-types'
import { createContext } from 'react'

const PlantBreakDown = createContext({ data: [], loading: false })

function usePlantBreakdown() {
  const context = useContext(PlantBreakDown)
  if (!context) {
    throw new Error(`usePlant must be used within a PlantBreakDown`)
  }

  return context
}

function PlantsBreakdown(props) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({})
  const year = props.currentYear === 'all' ? 'all' : props.currentYear

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)

        await axios(`/home/${props.currentPlant}/${year}/plant-breakdown`).then(({ data }) => setData(data))
      } catch (e) {
        console.log('Error main dashboard apis', e)
        setData({})
      } finally {
        setLoading(false)
      }
    })()
  }, [props.currentPlant, props.currentYear])

  const value = useMemo(
    () => ({
      data,
      loading,
      ...props,
    }),
    [data, loading],
  )

  return loading ? null : <PlantBreakDown.Provider value={value} {...props} />
}

PlantsBreakdown.propTypes = {
  currentYear: PropTypes.string.isRequired,
  currentPlant: PropTypes.string.isRequired,
}

export { PlantsBreakdown, usePlantBreakdown }
