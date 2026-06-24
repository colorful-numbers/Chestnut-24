import { useEffect, useState } from 'react'
import { locales, siteCopy } from '../data/siteContent'

const STORAGE_KEY = 'chestnut-locale'

export function normalizeLocale(locale) {
  return locales.includes(locale) ? locale : 'zh'
}

export function useI18n() {
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
      window.dispatchEvent(new CustomEvent('chestnut-locale-changed', { detail: normalized }))
    }
  }

  return {
    locale,
    locales,
    mounted,
    setLocale,
    t: siteCopy[locale],
  }
}
