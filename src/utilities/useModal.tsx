import { createContext, FC, ReactNode, useContext, useState } from 'react'

type modalContext<T = unknown> = {
  isModalOpen: (modalId: string) => boolean
  openModal: (modalId: string, payload?: unknown) => void
  closeModal: (modalId?: string) => void
  payload?: T
}

const ModalContext = createContext<modalContext | undefined>(undefined)

export const ModalProvider: FC<{ children: (context: modalContext) => ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{ modalId: string; payload?: unknown } | undefined>()

  const openModal = (modalId: string, payload: unknown) => {
    if (state?.modalId === modalId) return
    setState({ modalId, payload })
  }

  const closeModal = useCallback((modalId = undefined) => setState(modalId), [])
  const isOpen = useCallback((modalId: string) => state?.modalId === modalId, [state?.modalId])

  const value = useMemo(() => {
    return { isModalOpen: isOpen, openModal, closeModal, payload: state?.payload }
  }, [state])

  return <ModalContext.Provider value={value}>{children(value)}</ModalContext.Provider>
}

export function useModal<T = unknown>() {
  const context = useContext(ModalContext) as modalContext<T>
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }

  return context
}
