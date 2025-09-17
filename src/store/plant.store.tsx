import { axios } from '@/utilities/axios-instance'
import { useNavigate } from 'react-router-dom'
import { PlantsContext } from './plant.context'

function usePlants() {
  const context = useContext(PlantsContext)
  if (!context) {
    throw new Error(`usePlant must be used within a PlantsContext`)
  }

  return context
}

function PlantsProvider(props) {
  const navigate = useNavigate()
  const [plants, setPlants] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    axios
      .get('/plants', {
        params: {
          filter: {
            where: { is_active: true },
            fields: { id: true, name: true, icon_path: true, plantCategoryId: true },
            include: [{ relation: 'plantCategory', scope: { fields: { createdAt: false, updatedAt: false } } }],
          },
        },
      })
      .then(({ data }) => {
        if (data.length === 0) {
          navigate('/plants')
        } else {
          setPlants(data)
        }
      })
      .finally(() => setLoading(false))
  }, [count])

  const value = useMemo(
    () => ({
      plants,
      setPlants,
      loading,
      refetch: () => setCount((c) => c + 1),
    }),
    [plants, loading],
  )

  return loading ? null : <PlantsContext.Provider value={value} {...props} />
}

export { PlantsProvider, usePlants }
