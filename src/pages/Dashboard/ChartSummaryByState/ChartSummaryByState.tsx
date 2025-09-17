import { axios } from '@/utilities/axios-instance.ts'
import { useChartColors } from '@/utilities/use-chart-colors.ts'
import { cilWifiSignalOff } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CCardTitle, CSpinner } from '@coreui/react-pro'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { endOfYear, startOfYear } from 'date-fns'
import PropTypes from 'prop-types'
import { Bar } from 'react-chartjs-2'
import { transformDatasets } from './helpers'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function ChartSummaryByState({ currentYear, currentPlant }) {
  const chartRef = useRef(undefined)
  const [color, gridColor] = useChartColors()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ labels: [], datasets: [] })

  const yearStart = startOfYear(new Date(currentYear + ''))
  const yearEnd = endOfYear(new Date(currentYear + ''))

  useEffect(() => {
    const controller = new AbortController()

    try {
      const filter = {
        include: [
          {
            relation: 'plantActuals',
            scope: {
              ...(currentYear !== 'all' && { where: { date_planted: { between: [yearStart, yearEnd] } } }),
              include: [
                { relation: 'plantActualDetails' },
                {
                  relation: 'plant',
                  scope: {
                    fields: { name: true, id: true },
                    where: {
                      is_active: { eq: true },
                      ...(currentPlant !== 'all' && { name: { eq: currentPlant } }),
                    },
                  },
                },
              ],
            },
          },
        ],
      }

      async function GET() {
        await axios('/states', { params: { filter } })
          .then(transformDatasets)
          .then((data) => setData(data))
      }

      GET()
    } catch (e) {
      console.log('Error main dashboard apis', e)
      setData({ labels: [], datasets: [] })
    } finally {
      setLoading(false)
    }

    return () => controller.abort()
  }, [currentPlant, currentYear])

  if (loading) {
    return (
      <div className='flex items-center justify-center flex-col my-auto'>
        <CSpinner />
      </div>
    )
  }

  if (data.datasets.length === 0) {
    return (
      <div className='flex items-center justify-center flex-col my-auto'>
        <CIcon icon={cilWifiSignalOff} size='xl' className='text-gray-400!' />
        <p className='text-gray-400 mb-0'>Sorry no data available</p>
      </div>
    )
  }

  return (
    <>
      <CCardTitle className='text-2xl font-normal mb-4'>
        <strong>Summary by State</strong>
      </CCardTitle>

      <Bar
        ref={chartRef}
        data={{ labels: data.labels, datasets: data.datasets }}
        options={{
          responsive: true,
          indexAxis: 'y',
          animation: { duration: 10 },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color }, stacked: true },
            y: { grid: { color: gridColor }, ticks: { color }, stacked: true },
          },
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
    </>
  )
}

ChartSummaryByState.propTypes = {
  currentYear: PropTypes.string.isRequired,
  currentPlant: PropTypes.string.isRequired,
}
