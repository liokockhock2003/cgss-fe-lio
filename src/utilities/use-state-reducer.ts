const stateReducer = (state, action) => ({
  ...state,
  ...(typeof action === 'function' ? action(state) : action),
})

export const useStateReducer = (initial, lazyInitializer = null) => {
  const [state, setState] = useReducer(stateReducer, initial, (init) =>
    lazyInitializer ? lazyInitializer(init) : init,
  )

  return [state, setState]
}
