import { curry } from 'lodash-es'
import { useCallback, useState } from 'react'

/**
 * Use this hook when the state is like within the component, but if split across diff component use useModal
 * @param payload
 */
export function usePopoverStates<T extends Record<string, V>, V = unknown>(payload: T) {
  const [popoverStates, setPopoverStates] = useState<T>(payload)

  const handleOpenChange = useCallback((id: keyof T, open: V) => {
    setPopoverStates((prev) => ({ ...prev, [id]: open }))
  }, [])

  const handleOpenChangeWith = curry((key: keyof T, value: V) => handleOpenChange(key, value))

  return { popoverStates, handleOpenChange, handleOpenChangeWith }
}
