import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { dictionaries, type Dictionary, type Locale } from './dictionaries'

interface I18nValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Dictionary
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')
  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale],
  )
  return createElement(I18nContext.Provider, { value }, children)
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n outside provider')
  return ctx
}
