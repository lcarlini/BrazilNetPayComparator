import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeId = 'black' | 'light'

interface ThemeValue {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
}

const STORAGE_KEY = 'bnp-theme'
const ThemeContext = createContext<ThemeValue | null>(null)

function readStoredTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'black') return stored
  } catch {
    /* ignore */
  }
  return 'black'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => readStoredTheme())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme: (next: ThemeId) => setThemeState(next),
    }),
    [theme],
  )

  return createElement(ThemeContext.Provider, { value }, children)
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme outside provider')
  return ctx
}
