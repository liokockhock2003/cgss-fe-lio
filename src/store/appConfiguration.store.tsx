import { AppConfiguration, Aside, Theme } from './appConfiguration.context'

function useAppConfiguration() {
  const context = useContext(AppConfiguration)
  if (!context) {
    throw new Error(`useAppConfiguration must be used within a AppConfiguration`)
  }

  return context
}

function AppConfigurationProvider(props) {
  const [theme, _setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system')
  const [aside, _setAside] = useState<Aside>((localStorage.getItem('aside') as Aside) ?? 'open')
  const [sidebar, _setSidebar] = useState<boolean>(localStorage.getItem('sidebar') === 'true' || false)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const setTheme = (_theme: Theme) => {
    localStorage.setItem('theme', _theme)
    _setTheme(_theme)
  }

  const toggleSidebar = () => {
    _setSidebar((c) => {
      const next = !c
      localStorage.setItem('sidebar', next + '')
      return next
    })
  }

  const toggleAside = (nextAside: Aside) => {
    _setAside((currentAsideState) => {
      let next = undefined
      if (nextAside === 'open') {
        next = currentAsideState === 'open' || currentAsideState === 'fold' ? 'close' : 'open'
      } else if (nextAside === 'fold') {
        next = currentAsideState === 'close' || currentAsideState === 'open' ? 'fold' : 'open'
      }

      localStorage.setItem('aside', next)
      return next
    })
  }

  const value = useMemo(
    () => ({
      theme,
      aside,
      sidebar,
      toggleSidebar,
      setTheme,
      toggleAside,
    }),
    [theme, aside, sidebar],
  )

  return <AppConfiguration.Provider value={value} {...props} />
}

export { AppConfigurationProvider, useAppConfiguration }
