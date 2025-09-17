import { chartJsColors } from '@/utilities/tailwind-config'

export function transformDatasets({ data }) {
  const plantSets = new Set()
  function getNoOfSeedlingsPerState(state) {
    if (!state.plantActuals) return {}

    return state.plantActuals
      .flatMap((p) => {
        if (!p.plantActualDetails || !p.plant) return []

        return p.plantActualDetails.map((i) => {
          return {
            plantId: i.plantId,
            no_of_seedling: i.no_of_seedling,
            plant: { id: p.plant.id, name: p.plant.name },
          }
        })
      })
      .reduce((acc, p) => {
        if (acc[p.plant.name]) {
          acc[p.plant.name] += p.no_of_seedling
        } else {
          acc[p.plant.name] = p.no_of_seedling
          plantSets.add(p.plant.name)
        }

        return acc
      }, {})
  }

  const perState = data.reduce((acc, c) => {
    if (acc[c.state_name]) {
      const res = getNoOfSeedlingsPerState(c)

      Object.entries(res).forEach(([k, v]) => {
        if (acc[c.state_name][k]) acc[c.state_name][k] += v
        else acc[c.state_name][k] = v
      })
    } else {
      acc[c.state_name] = getNoOfSeedlingsPerState(c)
    }

    return acc
  }, {})

  const states = Object.keys(perState)
  const datasets = Object.entries(perState).reduce((acc, [state, v]) => {
    Array.from(plantSets.keys()).forEach((s, index) => {
      if (acc[s]) {
        acc[s].data.push(v[s] ?? 0)
      } else {
        acc[s] = { label: s, data: [v[s] ?? 0], borderRadius: 6, backgroundColor: chartJsColors[index] }
      }
    })

    return acc
  }, {})

  return { labels: states, datasets: Object.values(datasets) }
}

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { pointStyle: 'circle', usePointStyle: true },
    },
  },
}
