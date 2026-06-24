'use client'

import { useI18n } from '../lib/i18n'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span>{t.brand}</span>
        <p>{t.footer}</p>
        <a href="/privacy">Privacy</a>
      </div>
    </footer>
  )
}
