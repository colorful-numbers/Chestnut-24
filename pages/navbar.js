'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useRouter } from 'next/router'
import { useI18n } from '../lib/i18n'

function LanguageSwitch({ compact = false }) {
  const { locale, setLocale, t, maintenanceLocales = [] } = useI18n()
  const enDisabled = maintenanceLocales.includes('en')

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
        disabled={enDisabled}
        aria-disabled={enDisabled}
        title={enDisabled ? t.nav.maintenance : undefined}
        data-maintenance={enDisabled ? t.nav.maintenance : undefined}
      >
        EN
      </button>
    </div>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { t } = useI18n()
  const navItems = [
    { href: '/cast', label: t.nav.system },
    { href: '/defn', label: t.nav.defn },
    { href: '/fragments', label: t.nav.notice },
  ]

  useEffect(() => {
    const closeMenu = () => setIsOpen(false)
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu()
    }

    document.body.classList.toggle('nav-is-open', isOpen)
    window.addEventListener('keydown', onKeyDown)
    router.events.on('routeChangeComplete', closeMenu)

    return () => {
      document.body.classList.remove('nav-is-open')
      window.removeEventListener('keydown', onKeyDown)
      router.events.off('routeChangeComplete', closeMenu)
    }
  }, [isOpen, router.events])

  return (
    <nav className={`site-nav ${isOpen ? 'is-open' : ''}`}>
      <div className="site-nav__inner">
        <Link href="/" className="site-nav__brand" onClick={() => setIsOpen(false)}>
          <span>{t.brand}</span>
        </Link>

        <div className="site-nav__links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </div>

        <div className="site-nav__actions">
          <LanguageSwitch />
          <button
            type="button"
            className="site-nav__menu"
            aria-label={t.nav.menu}
            aria-expanded={isOpen}
            aria-controls="site-mobile-navigation"
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="site-nav__mobile" id="site-mobile-navigation">
          <div className="site-nav__mobile-links" aria-label="Mobile navigation">
            {navItems.map((item, index) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <span>0{index + 1}</span>
                <strong>{item.label}</strong>
                <ArrowUpRight size={20} />
              </Link>
            ))}
          </div>
          <div className="site-nav__mobile-footer">
            <LanguageSwitch compact />
            <Link href="/" onClick={() => setIsOpen(false)}>
              {t.brand}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
