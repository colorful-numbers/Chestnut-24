'use client'

import { useEffect, useState } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useI18n } from '../lib/i18n'

function LanguageSwitch({ compact = false }) {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className={`language-switch ${compact ? 'language-switch--compact' : ''}`} aria-label={t.nav.language}>
      <button
        type="button"
        className={locale === 'zh' ? 'is-active' : ''}
        onClick={() => setLocale('zh')}
      >
        中
      </button>
      <button
        type="button"
        className={locale === 'en' ? 'is-active' : ''}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
    </div>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme !== 'light' : true

  return (
    <button
      type="button"
      className="site-nav__icon"
      aria-label={t.nav.theme}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useI18n()
  const navItems = [
    { href: '/#overview', label: t.nav.overview },
    { href: '/#notice', label: t.nav.notice },
    { href: '/#system', label: t.nav.system },
  ]

  return (
    <nav className="site-nav">
      <div className="site-nav__inner">
        <a href="/" className="site-nav__brand">{t.brand}</a>

        <div className="site-nav__links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </div>

        <div className="site-nav__actions">
          <LanguageSwitch />
          <ThemeToggle />
          <button
            type="button"
            className="site-nav__menu"
            aria-label={t.nav.menu}
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="site-nav__mobile">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setIsOpen(false)}>{item.label}</a>
          ))}
          <LanguageSwitch compact />
        </div>
      )}
    </nav>
  )
}
