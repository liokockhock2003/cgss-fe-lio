import { useAppConfiguration } from '@/store'
import { chartJsColors } from '@/utilities/tailwind-config'
import { cilWifiSignalOff } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CCardTitle, CFormSelect, CSpinner } from '@coreui/react-pro'
import { ArcElement, Chart, Legend, Tooltip } from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { usePlantBreakdown } from './ProviderPlantBreakdown'

Chart.register(ArcElement, Tooltip, Legend)

export function ChartPiePlantBreakdown() {
  const { data: _data, loading, currentPlant } = usePlantBreakdown()
  const { theme } = useAppConfiguration()

  const refPie = useRef(undefined)
  const [type, setType] = useState('actual')
  const color = theme === 'dark' ? 'rgb(156 163 175 )' : ''

  if (loading) {
    return (
      <div className='flex items-center justify-center flex-col my-auto'>
        <CSpinner />
      </div>
    )
  }

  const data = {
    target: {
      labels: _data.target.labels,
      datasets: [
        {
          label: '# of',
          data: _data.target.datasets,
          borderWidth: 0,
          backgroundColor: currentPlant === 'all' ? chartJsColors : ['rgb(255, 99, 132)'],
        },
      ],
    },
    actual: {
      labels: _data.actual.labels,
      datasets: [
        {
          label: '# of',
          data: _data.actual.datasets,
          borderWidth: 0,
          backgroundColor: currentPlant === 'all' ? chartJsColors : ['rgb(54, 162, 235)'],
        },
      ],
    },
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex justify-between flex-wrap'>
        <CCardTitle className='text-2xl font-normal mb-0'>
          <strong>
            Plant <span className='capitalize'>{type}</span> Breakdown
          </strong>
        </CCardTitle>

        <CFormSelect
          className='w-[30%]!'
          size='sm'
          value={type}
          onChange={(e) => {
            setType(e.target.value)

            if (refPie.current) {
              refPie.current.data.labels = data[type].labels
              refPie.current.datasets = data[type].datasets
              refPie.current.update()
            }
          }}>
          <option value='' disabled>
            Select data source
          </option>
          <option value='actual'>Actual</option>
          <option value='target'>Target</option>
        </CFormSelect>
      </div>
      {data[type].labels.length === 0 ?
        <div className='flex items-center justify-center flex-col my-auto'>
          <CIcon icon={cilWifiSignalOff} size='xl' className='text-gray-400!' />
          <p className='text-gray-400 mb-0'>Sorry no data available</p>
        </div>
      : <Pie
          ref={refPie}
          className='my-auto'
          data={data[type]}
          options={{
            cutout: '50%',
            radius: '80%',
            responsive: true,
            plugins: {
              legend: {
                display: true,
                onClick: null,
                position: 'bottom',
                labels: { color, pointStyle: 'circle', usePointStyle: true },
              },
            },
          }}
        />
      }
    </div>
  )
}
