'use client'

import { useState } from 'react'
import { Menu, Settings, X } from 'lucide-react'
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

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useI18n()
  const navItems = [
    { href: '/#overview', label: t.nav.overview },
    { href: '/#notice', label: t.nav.notice },
    { href: '/#system', label: t.nav.system },
    { href: '/#tools', label: t.nav.tools },
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
          <a href="/settings" className="site-nav__icon" aria-label={t.nav.settings}>
            <Settings size={18} />
          </a>
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
          <a href="/settings" onClick={() => setIsOpen(false)}>{t.nav.settings}</a>
          <LanguageSwitch compact />
        </div>
      )}
    </nav>
  )
}
