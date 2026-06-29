import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { locales, siteCopy } from '../data/siteContent'

const STORAGE_KEY = 'chestnut-locale'
const I18nContext = createContext(null)

// Locales that exist in the content but are temporarily withdrawn. Selecting
// one falls back to zh and the language switch shows an "under maintenance"
// state instead of switching the whole site.
export const MAINTENANCE_LOCALES = ['en']

export function isLocaleAvailable(locale) {
  return locales.includes(locale) && !MAINTENANCE_LOCALES.includes(locale)
}

export function normalizeLocale(locale) {
  return isLocaleAvailable(locale) ? locale : 'zh'
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
    maintenanceLocales: MAINTENANCE_LOCALES,
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
      maintenanceLocales: MAINTENANCE_LOCALES,
      mounted: false,
      setLocale: () => {},
      t: siteCopy.zh,
    }
  }
  return context
}
