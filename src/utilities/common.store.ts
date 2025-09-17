export type Setter<T> = (data: T | ((prevState: T) => T)) => void

export type WithEmissionSymbols = {
  CO2: number
  N2O: number
  CH4: number
  CO2E: number
}
