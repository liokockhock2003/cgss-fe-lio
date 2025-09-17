import {sumBy} from 'lodash-es'

export const plantActualFilterRelations = {
  include: [
    {
      relation: 'enduser',
      scope: { fields: { name: true, email: true, phonenumber: true } },
    },
    {
      relation: 'state',
      scope: { fields: { state_name: true, location_site: true } },
    },
    {
      relation: 'plantActualDetails',
      scope: {
        fields: { no_of_seedling: true, plantActualId: true, plantSpeciesId: true },
        include: [
          {
            relation: 'plantSpecies',
            scope: { fields: { species_name: true, local_name: true } },
          },
        ],
      },
    },
  ],
}

export const transformerPlantActual = (i) => {
  const plantActualDetails = i?.plantActualDetails ?? []
  return {
    id: i.id,
    state_name: i.state.state_name,
    location_site: i.state.location_site,
    date_planted: i.date_planted, // format(new Date(i.date_planted), 'dd-LL-yyyy'),
    name: i.enduser.name,
    totalNoOfSeedling: sumBy(plantActualDetails, 'no_of_seedling'),
    species: plantActualDetails.map((p) => p.plantSpecies.species_name).join(', ') ?? '-',
    email: i.enduser.email,
    phonenumber: i.enduser.phonenumber,
    status: i.status,
    enduserId: i.enduserId,
    stateId: i.stateId,
  }
}

export const transformerPlantActualDetail = (i) => {
  return {
    ...i,
    id: i.id,
    height: i.height,
    latitude: i.latitude,
    longitude: i.longitude,
    geo_coverage: i.geo_coverage,
    no_of_seedling: i.no_of_seedling,
    plantActualId: i.plantActualId,
    plantSpeciesId: i.plantSpeciesId,
    species_name: i.plantSpecies.species_name,
    // updatedAt: i.updatedAt,
    // createdAt: i.createdAt,
  }
}
