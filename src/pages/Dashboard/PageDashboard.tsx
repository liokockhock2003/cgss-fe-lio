import { usePlants } from '@/store'
import { axios } from '@/utilities/axios-instance'
import { CCard } from '@coreui/react'
import { CFormSelect } from '@coreui/react-pro'
import { get } from 'lodash-es'
import { ChartLineActualVsTarget } from './ChartLineActualVsTarget'
import { ChartLineCo2 } from './ChartLineCo2'
import { ChartPiePlantBreakdown } from './ChartPiePlantBreakdown'
import { ChartSummary } from './ChartSummary'
import { ChartSummaryByState } from './ChartSummaryByState/ChartSummaryByState'
import './PageDashboard.scss'
import { PlantsBreakdown } from './ProviderPlantBreakdown'

const getFilterYears = () => {
  const filter = {
    fields: { plantActualId: true },
    include: [
      {
        relation: 'plantActual',
        scope: {
          fields: { date_planted: true, plantId: true },
          include: [{ relation: 'plant', scope: { fields: { name: true }, where: { is_active: { eq: true } } } }],
        },
      },
    ],
  }

  return axios('/plant-actual-details', { params: { filter } }).then((response) => {
    const allYears = response.data
      .filter((d) => get(d, 'plantActual.plant.name'))
      .map((d) => get(d, 'plantActual.date_planted'))
      .map((d) => new Date(d).getFullYear())
    return [...new Set(allYears)].sort().reverse()
  })
}

export const PageDashboard = () => {
  const { plants } = usePlants()

  const [years, setYears] = useState([])
  const [currentPlant, setCurrentPlant] = useState('all')
  const [currentYear, setCurrentYear] = useState('all')

  useEffect(() => {
    getFilterYears().then((_) => setYears(_))
  }, [])

  return (
    <div className='max-w-7xl mx-auto flex flex-col flex-1'>
      <div className='flex mb-2 space-x-2'>
        <CFormSelect
          className='w-[200px]!'
          size='sm'
          onChange={(e) => setCurrentPlant(e.target.value)}
          defaultValue={currentPlant}>
          <option value='all'>All Plants</option>
          {plants.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </CFormSelect>
        <CFormSelect
          className='w-[200px]!'
          size='sm'
          onChange={(e) => setCurrentYear(e.target.value)}
          defaultValue={currentYear}>
          <option value='all'>All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </CFormSelect>
      </div>
      <div className='home--grid'>
        <PlantsBreakdown currentYear={currentYear} currentPlant={currentPlant}>
          <CCard className='home--summary'>
            <ChartSummary />
          </CCard>

          <CCard className='home--pie-chart'>
            <ChartPiePlantBreakdown />
          </CCard>
        </PlantsBreakdown>

        <CCard className='home--line-chart'>
          <ChartLineActualVsTarget currentYear={currentYear} currentPlant={currentPlant} />
        </CCard>

        <CCard className='home--stackbar-chart md:row-start-4'>
          <ChartSummaryByState currentYear={currentYear} currentPlant={currentPlant} />
        </CCard>

        <CCard className='home--stackbar-chart'>
          <ChartLineCo2 />
        </CCard>
      </div>
    </div>
  )
}
