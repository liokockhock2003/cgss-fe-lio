import { Loading } from '@/components/Loading'
import { usePlants } from '@/store'
import { axios } from '@/utilities/axios-instance'
import { delayPromise } from '@/utilities/delay-promise'
import { toHumanizeDigits } from '@/utilities/to-humanize-digits'
import { cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardTitle,
  CCol,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSmartTable,
  CTooltip,
} from '@coreui/react-pro'
import humanFormat from 'human-format'
import { kebabCase, omit, sumBy } from 'lodash-es'
import PropTypes from 'prop-types'
import { Navigate, useParams } from 'react-router-dom'
import { ModalEditParameter } from './ModalEditPlantParameter'
import { PlantLink } from './PlantLink'
import { helper, transform } from './helper'

export function PagePlantGrowth() {
  const { name } = useParams()
  const { plants } = usePlants()

  // validation in case someone enter non-exist plant
  if (!plants.some((i) => kebabCase(i.name) === name)) {
    return <Navigate to='/dashboard' replace />
  }

  const currentPlant = plants.find((i) => kebabCase(i.name) === name)
  return <PlantGrowth currentPlant={currentPlant} plants={plants} />
}

function PlantGrowth({ currentPlant, plants }) {
  const [data, setData] = useState([])
  const [approach, setApproach] = useState('yearly-growth-rate')
  const [avgCo2Absorption, setAvgCo2Absorption] = useState(0)
  const [plantGrowthId, setPlanGrowthId] = useState(null)
  const [plantParameter, setPlantParameter] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)

    const controller = new AbortController()
    const payload = {
      fields: { updatedAt: false, createdAt: false },
      where: { plantId: { eq: currentPlant.id } },
    }

    axios
      .get('/plant-growth-rates', {
        controller: controller.signal,
        params: { filter: payload },
      })
      .then(({ data: d }) => {
        const responseData = d?.[0]
        const _plantParameter = responseData ?? { carbon_fraction: 0, ratio: 0 }

        setPlanGrowthId(responseData?.id)
        setPlantParameter(_plantParameter)
        setAvgCo2Absorption(responseData?.avg_co2_absorption ?? 0)
        setApproach(responseData?.approach ?? 'yearly-growth-rate')
        setData(transform(responseData?.details ?? [], _plantParameter))
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [currentPlant.id])

  const recalculatedAvgCo2Absorption = (d) => {
    const avg = sumBy(d, 'yearly_co2_absorption') / ((d.length === 1 ? 2 : d.length) - 1)
    setAvgCo2Absorption(() => avg)

    return avg
  }

  const saveAvgCo2 = (payload) => axios.patch(`/plant-growth-rates/${plantGrowthId}`, payload)

  const handleBlur = (item, key, row) => (e) => {
    const url = `/plant-growth-rates`
    const getId = +e.target.dataset.id
    const removedCommas = e.target.textContent.replaceAll(',', '')
    const value = parseFloat(removedCommas) ?? 0

    // check prev value is same with user entered or not
    if (isNaN(value) || item[key] === value || typeof parseFloat(removedCommas) !== 'number') {
      e.target.textContent = toHumanizeDigits(item[key]) // restore prev value
      return
    }

    const cellLoading = (shouldStart) => {
      if (shouldStart) {
        e.target.removeAttribute('contentEditable')
        e.target.classList.add('contenteditable-loading')
      } else {
        e.target.setAttribute('contentEditable', 'true')
        e.target.classList.remove('contenteditable-loading')
      }
    }

    const newData = transform(
      item.isLast ?
        [...data, omit({ ...item, [key]: value, plantId: currentPlant.id }, 'isLast')] // create
      : data.map((d, i) => (row === i ? { ...d, [key]: value } : d)), // edit
      plantParameter,
    )

    setData(newData)
    const avg_co2_absorption = recalculatedAvgCo2Absorption(newData)

    cellLoading(true)
    if (plantGrowthId) {
      Promise.all([
        delayPromise(),
        axios.patch(`${url}/${plantGrowthId}`, {
          avg_co2_absorption,
          details: newData.map(({ yearly_co2_absorption, ...d }) => d),
        }),
      ])
        .catch(() => {
          e.target.textContent = toHumanizeDigits(item[key])
          setData((d) => d.map((_d) => (_d.id === getId ? { ..._d, [key]: item[key] } : _d))) // restore prev value
        })
        .finally(() => cellLoading(false))
    } else {
      const { yearly_co2_absorption, plantId, ...details } = newData.at(-1)

      axios
        .post(url, { avg_co2_absorption, details: [details], plantId })
        .then(({ data: response }) => setPlanGrowthId(response?.id))
        .catch(() => {
          e.target.textContent = toHumanizeDigits(item[key])
          setData((d) => d.slice(0, -1)) // remove last since it failed to create
        })
        .finally(() => cellLoading(false))
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <CCard>
        <div className='p-4 space-y-3 flex-1'>
          <CCardTitle className='text-4xl font-normal'>
            <strong>{currentPlant.name} Growth</strong>
          </CCardTitle>

          <CRow>
            <CCol className='flex'>
              <CCard className='h-full rounded flex-1 dark:bg-gray-600'>
                <CCardBody>
                  <div className='h-full font-bold text-2xl text-gray-500 dark:text-gray-200 flex flex-col'>
                    <div className='flex flex-col mt-auto'>
                      <span className='text-center'>Carbon Fraction (CF): {plantParameter.carbon_fraction}</span>
                      <span className='text-center'>Ratio (R): {plantParameter.ratio}</span>
                    </div>

                    <ModalEditParameter
                      tableData={data}
                      plantGrowthId={plantGrowthId}
                      data={{ ...plantParameter, plantId: currentPlant.id }}
                      onApply={(newPlantParameter) => {
                        const _nextData = transform(data, newPlantParameter)
                        setData(_nextData)
                        setPlanGrowthId(() => newPlantParameter.id)
                        setPlantParameter({
                          ratio: newPlantParameter.ratio,
                          carbon_fraction: newPlantParameter.carbon_fraction,
                        })
                      }}
                    />
                  </div>
                  <div></div>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol>
              <PlantLink currentPlant={currentPlant} />
            </CCol>
          </CRow>
        </div>

        <CCardBody>
          <div className='mb-3 flex items-center justify-between gap-2'>
            <CInputGroup className='w-[350px]!'>
              <CInputGroupText>
                CO<sub>2</sub> &nbsp; Absorption
              </CInputGroupText>
              <CFormSelect
                size='sm'
                value={approach}
                onChange={(e) => {
                  let avgCo2 = avgCo2Absorption
                  setApproach(e.target.value)

                  if (e.target.value === 'yearly-growth-rate') {
                    avgCo2 = recalculatedAvgCo2Absorption(data)
                  }

                  saveAvgCo2({ avg_co2_absorption: avgCo2, approach: e.target.value })
                }}>
                <option value='' disabled>
                  Select growth rate approach
                </option>
                <option value='yearly-growth-rate'>Yearly Growth Rate</option>
                <option value='average-co2-absorption'>Average CO2 Absorption</option>
              </CFormSelect>
            </CInputGroup>

            <CTooltip content='Average co2 Absorption' placement='bottom'>
              <CInputGroup className='w-[350px]!'>
                <CInputGroupText>Avg Value:</CInputGroupText>
                <CFormInput
                  required
                  type='number'
                  name='avg_co2_absorption'
                  disabled={approach === 'yearly-growth-rate'}
                  value={humanFormat(avgCo2Absorption, { maxDecimals: 5 })}
                  onChange={(e) => {
                    setAvgCo2Absorption(e.target.valueAsNumber)
                    saveAvgCo2({ avg_co2_absorption: e.target.valueAsNumber, approach })
                  }}
                />
              </CInputGroup>
            </CTooltip>
          </div>

          {approach === 'yearly-growth-rate' && (
            <CSmartTable
              items={data.concat({
                isLast: true,
                dbh: 0,
                height: 0,
                carbon_stock: 0,
                total_co2_absorption: 0,
                yearly_co2_absorption: 0,
              })}
              itemsPerPage={50} // need to since default value is 10
              columns={helper(data)}
              tableProps={{ hover: true, striped: true, className: 'smart-table-dark' }}
              scopedColumns={{
                no_of_year: (item, index) => {
                  return (
                    <td>
                      {index + 1}
                      {data.length - 1 === index && (
                        <CTooltip content='Delete this row' placement='right'>
                          <CButton
                            color='danger'
                            className='ml-2'
                            onClick={() => {
                              const details = data.filter((_, _index) => _index !== index)

                              axios
                                .patch(`/plant-growth-rates/${plantGrowthId}`, { details })
                                .then(() => setData(details))
                            }}>
                            <CIcon size='sm' icon={cilTrash} className='text-white' />
                          </CButton>
                        </CTooltip>
                      )}
                    </td>
                  )
                },
                dbh: (item, index) => (
                  <td>
                    <div
                      contentEditable={!!plantGrowthId}
                      onBlur={handleBlur(item, 'dbh', index)}
                      dangerouslySetInnerHTML={{ __html: toHumanizeDigits((item.isLast ? '' : item.dbh) ?? 0) }}
                    />
                  </td>
                ),
                height: (item, index) => (
                  <td>
                    <div
                      contentEditable={!!plantGrowthId}
                      onBlur={handleBlur(item, 'height', index)}
                      dangerouslySetInnerHTML={{ __html: toHumanizeDigits((item.isLast ? '' : item.height) ?? 0) }}
                    />
                  </td>
                ),
                carbon_stock: (item) => (
                  <td className='text-right'>{item.isLast ? '-' : toHumanizeDigits(item.carbon_stock)}</td>
                ),
                total_co2_absorption: (item) => (
                  <td className='text-right'>{item.isLast ? '-' : toHumanizeDigits(item.total_co2_absorption)}</td>
                ),
                yearly_co2_absorption: (item, index) => (
                  <td className='text-right'>
                    {index === 0 ?
                      'n/a'
                    : item.isLast ?
                      '-'
                    : toHumanizeDigits(item.yearly_co2_absorption)}
                  </td>
                ),
              }}
            />
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

PlantGrowth.propTypes = {
  plants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      species_name: PropTypes.string,
      local_name: PropTypes.string,
    }),
  ),
  currentPlant: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
}
