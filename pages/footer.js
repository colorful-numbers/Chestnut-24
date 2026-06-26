'use client'

import { useI18n } from '../lib/i18n'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <span>{t.brand}</span>
          <p>{t.footer}</p>
        </div>
        <nav className="site-footer__menu" aria-label="Footer navigation">
          <a href="https://github.com/colorful-numbers" target="_blank" rel="noopener noreferrer">{t.footerMenu.lab}</a>
          <a href="https://index.trance-0.com" target="_blank" rel="noopener noreferrer">{t.footerMenu.oldIndex}</a>
          <a href="https://github.com/colorful-numbers/Chestnut-24/tree/main/docs" target="_blank" rel="noopener noreferrer">{t.footerMenu.docs}</a>
          <a href="/privacy">{t.footerMenu.privacy}</a>
        </nav>
      </div>
    </footer>
  )
}
