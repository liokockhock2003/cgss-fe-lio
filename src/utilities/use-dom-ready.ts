export function useDomReady({ qSelector } = { qSelector: '#breadcrumb-right-side' }) {
  const [dom, setDomReady] = useState(undefined)

  useEffect(() => {
    setDomReady(document.querySelector(qSelector))
  }, [])

  return dom
}

// certain page who have longer child nodes will set the main height: auto;
export function useMainHeightAuto() {
  const mainEl = useDomReady({ qSelector: 'main' })

  useEffect(() => {
    if (!mainEl) return
    mainEl.style.height = 'auto'
    mainEl.style.minHeight = '100vh'

    return () => {
      mainEl.style.removeProperty('height')
      mainEl.style.removeProperty('min-height')
    }
  }, [mainEl])
}
