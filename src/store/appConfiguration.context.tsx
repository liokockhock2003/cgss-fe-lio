import { createContext, Dispatch, SetStateAction } from 'react'

export type Aside = 'open' | 'close' | 'fold'
export type Theme = 'dark' | 'light' | 'system'

export const AppConfiguration = createContext<{
  theme: Theme
  aside: Aside
  sidebar: boolean
  setTheme: Dispatch<SetStateAction<Theme>>
  toggleAside: Dispatch<SetStateAction<Aside>>
  toggleSidebar: () => void
}>(undefined)
