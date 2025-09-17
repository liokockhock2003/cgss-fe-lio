import { Loading } from '@/components/Loading'
import { usePlants } from '@/store'
import { axios } from '@/utilities/axios-instance'
import { CCard, CCardBody, CCardTitle } from '@coreui/react-pro'
import PropTypes from 'prop-types'
import { ModalDeletePlant } from './ModalDeletePlant'
import { ModalDeletePlantCategory } from './ModalDeletePlantCategory'
import { ModalEditPlant } from './ModalEditPlant'
import { ModalEditPlantCategory } from './ModalEditPlantCategory'
import { ModalToggleActivePlant } from './ModalToggleActivePlant'

export function PagePlant() {
  const { refetch } = usePlants()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [_temp, _tempRefetch] = useState(0)

  function onRefetch() {
    refetch()
    _tempRefetch(Math.random())
  }

  const handleEditModel = (categoryId) => (updatedData) => {
    setData((_categories) => {
      return _categories.map((c) => {
        if (c.id === categoryId) {
          return {
            ...c,
            plants: c.plants.map((p) => {
              if (p.id === updatedData.id) return updatedData
              return p
            }),
          }
        }

        return c
      })
    })

    onRefetch()
  }

  useEffect(() => {
    setLoading(true)
    const controller = new AbortController()
    const include = ['plantTargets', 'plantActuals', 'plantGrowthRate', 'plantSpecies', 'plantUrls', 'plantCategory']
    const fields = { createdAt: false, updatedAt: false }

    axios
      .get('/plant-categories', {
        signal: controller.signal,
        params: {
          filter: {
            fields,
            include: [
              {
                fields,
                relation: 'plants',
                scope: { include: include.map((relation) => ({ relation, fields })) },
              },
            ],
          },
        },
      })
      .then(({ data: response }) => {
        const transformed = (response ?? []).map((d) => {
          return {
            ...d,
            plants: (d?.plants ?? []).map((item) => {
              return {
                id: item.id,
                name: item.name,
                icon_path: item.icon_path,
                is_active: item.is_active,
                isDeletable: !include.filter((_) => _ !== 'plantCategory').some((relation) => Boolean(item[relation])),
              }
            }),
          }
        })
        setData(transformed)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [_temp])

  if (loading) {
    return <Loading />
  }

  return (
    <CCard>
      <div className='p-4 space-y-3 flex-1'>
        <div className='flex justify-between'>
          <CCardTitle className='text-4xl font-normal'>
            <strong>Plants</strong>
          </CCardTitle>

          <ModalEditPlantCategory type='create' data={{ name: '' }} onApply={() => _tempRefetch(Math.random())} />
        </div>
      </div>

      <CCardBody className='pt-0!'>
        <div className='space-y-2'>
          {data.map((plantCategory) => {
            const isCategoryDeletable = plantCategory.plants.length === 0

            return (
              <div key={plantCategory.id} className='rounded border border-gray-300 border-solid'>
                {/* plantCategory */}
                <div className='flex justify-between items-center p-3'>
                  <div className='flex gap-2 items-center'>
                    <h3 className='mb-0'>{plantCategory.name}</h3>

                    <ModalEditPlantCategory
                      type='edit'
                      data={plantCategory}
                      onApply={() => _tempRefetch(Math.random())}
                    />
                  </div>

                  <div className='flex gap-2 items-center'>
                    <ModalEditPlant
                      type='create'
                      data={{ name: '', is_active: true, icon_path: '', plantCategoryId: plantCategory.id }}
                      onApply={(newData) => {
                        setData((_categories) => {
                          return _categories.map((c) => {
                            if (c.id === plantCategory.id) {
                              return { ...c, plants: [...c.plants, newData] }
                            }

                            return c
                          })
                        })

                        onRefetch()
                      }}
                    />

                    <ModalDeletePlantCategory
                      data={plantCategory}
                      label='name'
                      isCategoryDeletable={isCategoryDeletable}
                      onApply={(id) => {
                        setData((plantCategories) => plantCategories.filter((pc) => pc.id !== id))
                      }}
                    />
                  </div>
                </div>

                {/*  plants */}
                <div className='flex flex-col'>
                  {plantCategory.plants.map((p) => {
                    return (
                      <div key={p.id} className='px-3 py-2 border-top-1 border-gray-300 flex justify-between'>
                        <div>{p.name}</div>

                        <div className='flex gap-2'>
                          <ModalToggleActivePlant
                            data={p}
                            label='name'
                            onApply={handleEditModel(plantCategory.id)}
                            disabledCheck={p.is_active ? data.filter((i) => i.is_active).length <= 2 : false}
                          />

                          <ModalEditPlant type='edit' data={p} onApply={handleEditModel(plantCategory.id)} />

                          <ModalDeletePlant
                            data={p}
                            label='name'
                            onApply={(deleteId) => {
                              setData((_categories) => {
                                return _categories.map((c) => {
                                  if (c.id === plantCategory.id) {
                                    return { ...c, plants: c.plants.filter((p) => p.id !== deleteId) }
                                  }

                                  return c
                                })
                              })

                              onRefetch()
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </CCardBody>
    </CCard>
  )
}

PagePlant.propTypes = {
  plants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      icon_path: PropTypes.string,
      is_active: PropTypes.bool,
    }),
  ),
}
