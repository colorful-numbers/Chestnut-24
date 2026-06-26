import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { locales, siteCopy } from '../data/siteContent'

const STORAGE_KEY = 'chestnut-locale'
const I18nContext = createContext(null)

export function normalizeLocale(locale) {
  return locales.includes(locale) ? locale : 'zh'
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState('zh')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedLocale = typeof window !== 'undefined'
      ? window.localStorage.getItem(STORAGE_KEY)
      : null
    setLocaleState(normalizeLocale(savedLocale || 'zh'))
    setMounted(true)
  }, [])

  const setLocale = (nextLocale) => {
    const normalized = normalizeLocale(nextLocale)
    setLocaleState(normalized)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, normalized)
    }
  }

  const value = useMemo(() => ({
    locale,
    locales,
    mounted,
    setLocale,
    t: siteCopy[locale],
  }), [locale, mounted])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    return {
      locale: 'zh',
      locales,
      mounted: false,
      setLocale: () => {},
      t: siteCopy.zh,
    }
  }
  return context
}
