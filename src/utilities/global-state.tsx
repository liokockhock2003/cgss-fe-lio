import { Updater, useQuery, useQueryClient } from '@tanstack/react-query'

export function createGlobalState<T>(key: unknown, initialData: T | null = null) {
  const queryKey = ['state', key]

  return function () {
    const queryClient = useQueryClient()

    const { data: state } = useQuery({
      queryKey,
      initialData,
      queryFn: () => initialData,

      refetchInterval: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false,
    })

    const setState = useCallback((stateOrSetter: Updater<T, T>) => {
      queryClient.setQueryData(queryKey, (currentData: T | undefined) => {
        if (typeof stateOrSetter === 'function') {
          // @ts-ignore
          return stateOrSetter(currentData)
        }

        if (typeof currentData === 'object' && currentData !== null && typeof stateOrSetter === 'object') {
          return { ...currentData, ...stateOrSetter }
        }

        return stateOrSetter
      })
    }, [])

    const resetData = useCallback(() => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.refetchQueries({ queryKey })
    }, [])

    return { state, setState, resetData }
  }
}
