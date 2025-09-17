import { axios } from '@/utilities/axios-instance'
import { colors } from '@/utilities/tailwind-config.ts'
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
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export function ChartLineCo2() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({})
  const [color, gridColor] = useChartColors()

  useEffect(() => {
    const controller = new AbortController()

    ;(async () => {
      try {
        setLoading(true)
        const controller = new AbortController()

        await axios('/home/annual-co2-emission', { signal: controller.signal }).then(({ data }) => setData(data))
      } catch (e) {
        console.log('Error main dashboard apis', e)
        setData({})
      } finally {
        setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center flex-col my-auto'>
        <CSpinner />
      </div>
    )
  }

  if (data.years.length === 0) {
    return (
      <div className='flex items-center justify-center flex-col my-auto'>
        <CIcon icon={cilWifiSignalOff} size='xl' className='text-gray-400!' />
        <p className='text-gray-400 mb-0'>Sorry no data available</p>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full'>
      <CCardTitle className='text-2xl font-normal mb-4'>
        <strong>
          Annual CO<sub>2</sub> Emission
        </strong>
      </CCardTitle>

      <Line
        className='my-auto'
        data={{
          labels: data.years,
          datasets: [
            {
              label: 'CO2 Emission',
              backgroundColor: 'transparent',
              borderColor: colors.blue[400],
              pointBackgroundColor: colors.blue[400],
              data: data.emission,
            },
            {
              label: 'CO2 Emission (With Carbon Offset)',
              backgroundColor: 'transparent',
              borderColor: colors.green[400],
              pointBackgroundColor: colors.green[400],
              data: data.emissionOffset,
            },
          ],
        }}
        options={{
          scales: {
            y: {
              grid: { color: gridColor },
              ticks: { color },
              title: { display: true, text: 'CO2 Emission,tonne', color },
            },
            x: {
              grid: { color: gridColor },
              ticks: { color },
              title: { display: true, text: 'Year', color },
            },
          },
          interaction: { mode: 'nearest', axis: 'x', intersect: false },
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              display: true,
              labels: { color, pointStyle: 'circle', usePointStyle: true },
            },
          },
        }}
      />
    </div>
  )
}
