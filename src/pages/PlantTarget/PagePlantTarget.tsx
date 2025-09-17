import { Loading } from '@/components/Loading'
import { axios } from '@/utilities/axios-instance'
import { defaultTableStyle } from '@/utilities/default-table-styles'
import { delayPromise } from '@/utilities/delay-promise'
import { toHumanizeDigits } from '@/utilities/to-humanize-digits'
import { cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CButtonGroup, CCard, CCardBody, CCardTitle, CFormSelect, CSmartTable } from '@coreui/react-pro'
import PropTypes from 'prop-types'

export function PagePlantTarget() {
  const [data, setData] = useState([])
  const [cols, setCols] = useState([])
  const [years, setYears] = useState([])
  const [scopedCol, setScopedCols] = useState({})
  const [loading, setLoading] = useState(false)
  const [filterAYear, setFilterAYear] = useState('all_year')

  useEffect(() => {
    setLoading(true)

    const controller = new AbortController()
    axios
      .get('/plants', {
        params: { filter: { where: { is_active: { eq: true } }, include: [{ relation: 'plantTargets' }] } },
        signal: controller.signal,
      })
      .then(({ data: d }) => {
        const { yearInSequence, tableData } = transformer(d)

        setData(tableData)
        setYears(yearInSequence)
        setCols(yearInSequence.map((y) => ({ key: y, label: y })))
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  useEffect(() => {
    setScopedCols(() => {
      return years.reduce((acc, year) => {
        acc[year] = (item) => (
          <td>
            <div
              className='w-[95px] mr-auto'
              contentEditable
              data-year={year}
              data-id={item.id}
              dangerouslySetInnerHTML={{ __html: toHumanizeDigits(item[year] ?? 0) }}
              onBlur={(e) => {
                const value = e.target.textContent.replaceAll(',', '')
                const target = parseFloat(value) ?? 0

                if (item[year] === target) return // don't save is same value as prev, more than 7 digits,
                if (value.length >= 8) {
                  e.target.textContent = toHumanizeDigits(item[year] ?? 0)
                  return
                }

                const getId = +e.target.dataset.id
                const getYear = +e.target.dataset.year

                e.target.removeAttribute('contentEditable')
                e.target.classList.add('contenteditable-loading')

                Promise.all([
                  delayPromise(),
                  target > 0 ?
                    axios.post('/plant-targets/upsert', { target, year: getYear, plantId: getId })
                  : axios.post(`/plant-targets/deleteByCell`, { year: getYear, plantId: getId }),
                ])
                  .then(() => {
                    setData((prevData) => prevData.map((d) => (d.id === item.id ? { ...d, [getYear]: target } : d)))
                  })
                  .finally(() => {
                    e.target.setAttribute('contentEditable', 'true')
                    e.target.classList.remove('contenteditable-loading')
                  })
              }}
            />
          </td>
        )

        return acc
      }, {})
    })

    // eslint-disable-next-line
  }, [years.length])

  function handleAddYearFromBehind() {
    const currentYear = (years[years.length - 1] ? years[years.length - 1] : new Date().getFullYear()) - 1

    setData((c) => c.map((i) => ({ ...i, [currentYear]: 0 })))

    setYears((c) => {
      c.push(currentYear)
      return [...c]
    })

    setCols((c) => {
      c.push({ key: currentYear, label: currentYear })
      return [...c]
    })
  }

  function handleAddYear() {
    let currentYear = null
    if (years[0]) {
      currentYear = years[0] + 1
    } else {
      currentYear = new Date().getFullYear()
    }

    setData((c) => c.map((i) => ({ ...i, [currentYear]: 0 })))

    setYears((c) => {
      c.unshift(currentYear)
      return [...c]
    })

    setCols((c) => {
      c.unshift({ key: currentYear, label: currentYear })
      return [...c]
    })
  }

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <CCard>
        <div className='p-4 space-y-3 flex-1'>
          <div className='flex justify-between'>
            <CCardTitle className='text-4xl font-normal'>
              <strong>Plants Target</strong>
            </CCardTitle>

            {filterAYear === 'all_year' ?
              <CButtonGroup role='group' aria-label='Basic example'>
                <CButton className='flex! items-center' onClick={handleAddYear}>
                  <CIcon size='xl' icon={cilPlus} className='text-white pr-2' />
                  Add {(years[0] ?? new Date().getFullYear() - 1) + 1} year
                </CButton>

                <CButton className='flex! items-center' onClick={handleAddYearFromBehind}>
                  <CIcon size='xl' icon={cilPlus} className='text-white pr-2' />
                  Add {(years[years.length - 1] ?? new Date().getFullYear() - 1) - 1} year
                </CButton>
              </CButtonGroup>
            : null}
          </div>
        </div>

        <CCardBody>
          <CSmartTable
            className={filterAYear === 'all_year' ? '' : 'w-430px'}
            items={data}
            tableProps={{ hover: true, striped: true, className: 'smart-table-dark', responsive: true }}
            scopedColumns={{ index: (item) => <td>{item.name}</td>, ...scopedCol }}
            columns={defaultTableStyle([
              {
                key: 'index',
                label: <SelectAYear filterAYear={filterAYear} years={years} setFilterAYear={setFilterAYear} />,
                filter: false,
                sorter: false,
                _style: { width: '10%' },
              },
              ...(filterAYear === 'all_year' ? cols : cols.filter((column) => filterAYear === column.key)),
            ])}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

const transformer = (data) => {
  const years = new Set()
  const temp2 = data.map((i) => {
    const plantTargets = i.plantTargets ?? []

    plantTargets.forEach((pT) => years.add(pT.year))

    return { ...i, plantTargets }
  })

  const yearInSequence = [...years]
    .toSorted()
    .flatMap((y, index, arr) => {
      const nextItem = arr[index + 1]
      const r = [y]

      // @ts-ignore
      while (r.at(-1) + 1 < nextItem) {
        // @ts-ignore
        r.push(r.at(-1) + 1)
      }

      return r
    })
    .toReversed()

  const tableData = temp2.map((i) => {
    const yearToTargets = yearInSequence.reduce((acc, c) => {
      acc[c] = i.plantTargets.find((_) => _.year === c)?.target ?? 0

      return acc
    }, {})

    // @ts-ignore
    return { id: i.id, name: i.name, ...yearToTargets }
  })

  return { tableData, yearInSequence }
}

const SelectAYear = ({ years, filterAYear, setFilterAYear }) => {
  return (
    <CFormSelect
      className='w-48!'
      defaultValue={filterAYear}
      onChange={(e) => setFilterAYear(e.target.value === 'all_year' ? 'all_year' : parseFloat(e.target.value))}>
      <option value={'all_year'}>All Years</option>
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </CFormSelect>
  )
}

SelectAYear.propTypes = {
  filterAYear: PropTypes.any.isRequired,
  setFilterAYear: PropTypes.func.isRequired,
  years: PropTypes.arrayOf(PropTypes.number).isRequired,
}
