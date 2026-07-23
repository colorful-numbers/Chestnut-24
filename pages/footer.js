'use client'

import { useEffect, useRef } from 'react'
import { useI18n } from '../lib/i18n'

const VERSION = process.env.NEXT_PUBLIC_APP_VERSION || ''

export default function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()
  const footerRef = useRef(null)

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return undefined

    let frame = 0
    const update = () => {
      frame = 0
      const rect = footer.getBoundingClientRect()
      const range = Math.max(window.innerHeight * 0.7, 1)
      const progress = Math.min(Math.max((window.innerHeight - rect.top) / range, 0), 1)
      footer.style.setProperty('--footer-progress', progress.toFixed(4))
    }
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <footer className="site-footer" ref={footerRef}>
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
          <a href="/cast">{t.footerMenu.cast}</a>
          <a href="/defn">{t.footerMenu.world}</a>
          <a href="/fragments">{t.footerMenu.stories}</a>
          <a href="/docs">{t.footerMenu.docs}</a>
          <a href="/privacy">{t.footerMenu.privacy}</a>
        </nav>
      </div>
    </footer>
  )
}
