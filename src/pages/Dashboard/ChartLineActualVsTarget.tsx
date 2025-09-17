import { axios } from '@/utilities/axios-instance'
import { colorActual, colorTarget } from '@/utilities/tailwind-config'
import { useChartColors } from '@/utilities/use-chart-colors'
import { cilWifiSignalOff } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CCardTitle, CSpinner } from '@coreui/react-pro'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import PropTypes from 'prop-types'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export function ChartLineActualVsTarget({ currentYear, currentPlant }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({})
  const year = currentYear === 'all' ? new Date().getFullYear() : currentYear
  const [color, gridColor] = useChartColors()

  useEffect(() => {
    const controller = new AbortController()

    ;(async () => {
      try {
        setLoading(true)
        const controller = new AbortController()

        await axios(`/home/${currentPlant}/${year}/actual-vs-target`, { signal: controller.signal }).then(
          ({ data }) => {
            setData({
              labels: data.years,
              datasets: [
                { label: 'Actual Planted', data: data.actuals, ...colorActual },
                { label: 'Target Plant', data: data.targets, ...colorTarget },
              ],
            })
          },
        )
      } catch (e) {
        console.log('Error main dashboard apis', e)
        setData({})
      } finally {
        setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [currentPlant, currentYear])

  if (loading) {
    return (
      <div className='flex items-center justify-center flex-col my-auto'>
        <CSpinner />
      </div>
    )
  }

  if (data.labels.length === 0) {
    return (
      <div className='flex items-center justify-center flex-col my-auto'>
        <CIcon icon={cilWifiSignalOff} size='xl' className='text-gray-400!' />
        <p className='text-gray-400 mb-0'>Sorry no data available</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex'>
        <CCardTitle className='text-2xl font-normal mb-0'>
          <strong>Plant Actual vs Target</strong>
        </CCardTitle>
      </div>

      <Line
        className='my-auto'
        data={data}
        options={{
          scales: {
            y: {
              ticks: { color },
              grid: { color: gridColor },
              title: { color, display: true, text: 'Total Trees Planted' },
            },
            x: {
              ticks: { color },
              grid: { color: gridColor },
              title: { color, display: true, text: 'Past 5 Years' },
            },
          },
          interaction: { mode: 'nearest', axis: 'x', intersect: false },
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              display: true,
              onClick: null,
              labels: { color, pointStyle: 'circle', usePointStyle: true },
            },
          },
        }}
      />
    </div>
  )
}

ChartLineActualVsTarget.propTypes = {
  currentYear: PropTypes.string.isRequired,
  currentPlant: PropTypes.string.isRequired,
}
