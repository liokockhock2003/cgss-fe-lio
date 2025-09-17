import {cilPencil} from '@coreui/icons'
import CIcon from '@coreui/icons-react'


export const transform = (data, plantParameter) => {
  const result = data.reduce((acc, d, index) => {
    const useHeightValue = index <= 5 // if index less than 5 years will use height, more than use dbh
    const value = useHeightValue ? d.height : d.dbh

    const carbon_stock = useHeightValue
      ? ((1 * (-653 + 20.4 * value)) / 1000) * plantParameter.carbon_fraction
      : (value * 0.235) ** 2.42 * 0.47

    const total_co2_absorption = (((carbon_stock * 44) / 12) * plantParameter.ratio) / 1000

    const usePrevYearValues = acc[index - 1]
    const yearly_co2_absorption = usePrevYearValues ? total_co2_absorption - usePrevYearValues.total_co2_absorption : 0

    acc.push({
      ...d,
      carbon_stock: parseFloat(carbon_stock.toFixed(5)),
      total_co2_absorption: parseFloat(total_co2_absorption.toFixed(5)),
      yearly_co2_absorption: parseFloat(yearly_co2_absorption.toFixed(5)),
    })

    return acc
  }, [])

  return result
}

export const helper = (data) => [
  {
    key: 'no_of_year',
    label: 'Year',
    _style: {
      width: '10%',
      backgroundColor: '#044A89',
      color: 'white',
      _props: { color: 'primary', className: 'fw-semibold' },
    },
  },
  {
    key: 'dbh',
    label: (
      <label className="flex justify-between items-center">
        DBH (cm)
        <CIcon className="ml-2" icon={cilPencil} />
      </label>
    ),
    _style: { width: '15%', backgroundColor: '#044A89', color: 'white' },
    _props: { color: 'primary', className: 'fw-semibold' },
  },
  {
    key: 'height',
    label: (
      <label className="flex justify-between items-center">
        Height (cm) <CIcon className="ml-2" icon={cilPencil} />
      </label>
    ),
    _style: { width: '15%', backgroundColor: '#044A89', color: 'white' },
    _props: { color: 'primary', className: 'fw-semibold' },
  },
  {
    key: 'carbon_stock',
    label: 'Carbon Stock (kg)',
    _style: { width: '15%', backgroundColor: '#044A89', color: 'white' },
    _props: { color: 'primary', className: 'fw-semibold' },
  },
  {
    key: 'total_co2_absorption',
    label: 'Total CO2 Absorption (tonne/year)',
    _style: { width: '20%', backgroundColor: '#044A89', color: 'white' },
  },
  {
    key: 'yearly_co2_absorption',
    label: 'Yearly CO2 Absorption (tonne/year)',
    _style: { width: '20%', backgroundColor: '#044A89', color: 'white' },
    _props: { color: 'primary', className: 'fw-semibold' },
  },
]
