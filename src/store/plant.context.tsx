import { createContext, Dispatch, SetStateAction } from 'react'

export interface Plants {
  id: number
  name: string
  icon_path: string
  plantCategoryId: number
  plantCategory: {
    id: number
    name: string
  }
}

export const PlantsContext = createContext<{
  plants: Plants[]
  setPlants: Dispatch<SetStateAction<Plants[]>>
  loading: boolean
  refetch: () => void
}>(undefined)
