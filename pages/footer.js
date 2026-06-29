'use client'

import { useI18n } from '../lib/i18n'

const VERSION = process.env.NEXT_PUBLIC_APP_VERSION || ''

export default function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <span>{t.brand}</span>
          <div className="site-footer__tagline">
            <p>{t.footer}</p>
            <p className="site-footer__meta">
              © {year} {t.brand}{VERSION ? ` · ${VERSION}` : ''} · {t.footerRights}
            </p>
          </div>
        </div>
        <nav className="site-footer__menu" aria-label="Footer navigation">
          <a href="https://github.com/colorful-numbers" target="_blank" rel="noopener noreferrer">{t.footerMenu.lab}</a>
          <a href="https://index.trance-0.com" target="_blank" rel="noopener noreferrer">{t.footerMenu.oldIndex}</a>
          <a href="/docs">{t.footerMenu.docs}</a>
          <a href="/privacy">{t.footerMenu.privacy}</a>
        </nav>
      </div>
    </footer>
  )
}
