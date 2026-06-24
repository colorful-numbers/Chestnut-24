import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Box, Newspaper, Package, RadioTower } from 'lucide-react'
import Navbar from './navbar'
import Footer from './footer'
import ToolArchive from '../components/ToolArchive'
import { useI18n } from '../lib/i18n'

function useRevealObserver() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('.reveal'))

    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible')
      })
    }, { threshold: 0.14 })

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
}

function HeroDiagram() {
  return (
    <div className="info-hero__diagram" aria-label="Site information signal diagram">
      <svg viewBox="0 0 720 520" role="img">
        <title>Archive signal grid and information modules</title>
        <defs>
          <linearGradient id="signalLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#f1efe4" stopOpacity="0.12" />
            <stop offset="0.5" stopColor="#85d5db" stopOpacity="0.8" />
            <stop offset="1" stopColor="#e0a15b" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <path className="diagram-horizon" d="M28 374 C160 332 282 354 394 326 C510 297 601 302 692 252" />
        <g className="diagram-grid">
          {Array.from({ length: 9 }).map((_, index) => (
            <path key={`g-${index}`} d={`M${80 + index * 64} 332 L${28 + index * 75} 508`} />
          ))}
          {Array.from({ length: 7 }).map((_, index) => (
            <path key={`h-${index}`} d={`M42 ${370 + index * 22} C220 ${345 + index * 16} 470 ${340 + index * 16} 692 ${310 + index * 12}`} />
          ))}
        </g>
        <g className="diagram-signal">
          <path d="M126 196 L272 126 L416 164 L575 92" />
          <path d="M272 126 L354 258 L416 164 L488 258 L575 92" />
          {[[126, 196], [272, 126], [416, 164], [575, 92], [354, 258], [488, 258]].map(([x, y], index) => (
            <g key={`${x}-${y}`} style={{ '--delay': `${index * 0.35}s` }}>
              <circle cx={x} cy={y} r="12" />
              <circle cx={x} cy={y} r="28" />
            </g>
          ))}
        </g>
        {[180, 330, 515, 628].map((x, index) => (
          <g key={x} className="diagram-module" style={{ '--delay': `${index * 0.5}s` }}>
            <rect x={x} y={355 - index * 12} width="54" height="74" />
            <circle cx={x + 27} cy={342 - index * 12} r="5" />
          </g>
        ))}
      </svg>
    </div>
  )
}

function NoticeBoard({ copy }) {
  const [activeTab, setActiveTab] = useState(copy.notice.tabs[0])

  const filteredItems = useMemo(() => {
    if (activeTab === copy.notice.tabs[0]) return copy.notice.items
    return copy.notice.items.filter((item) => item.type === activeTab)
  }, [activeTab, copy.notice.items, copy.notice.tabs])

  return (
    <section id="notice" className="info-section notice-board reveal">
      <div className="section-heading">
        <span>{copy.notice.label}</span>
        <h2>{copy.notice.title}</h2>
      </div>
      <div className="notice-tabs" role="tablist" aria-label={copy.notice.title}>
        {copy.notice.tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? 'is-active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="notice-list">
        {filteredItems.map((item) => (
          <article key={`${item.date}-${item.title}`} className="notice-card">
            <time>{item.date}</time>
            <span>{item.type}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function InfoModules({ copy }) {
  const icons = [Newspaper, RadioTower, Box, Package]

  return (
    <section id="system" className="info-section reveal">
      <div className="section-heading section-heading--wide">
        <div>
          <span>{copy.system.label}</span>
          <h2>{copy.system.title}</h2>
        </div>
        <p>{copy.system.body}</p>
      </div>
      <div className="info-module-grid">
        {copy.system.cards.map((card, index) => {
          const Icon = icons[index] || Box
          return (
            <article key={card.title} className="info-module-card">
              <Icon size={20} />
              <span>{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default function Home() {
  const { t } = useI18n()
  useRevealObserver()

  return (
    <div className="info-site min-h-screen flex flex-col">
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main>
        <section id="overview" className="info-hero">
          <div className="info-hero__copy reveal">
            <span>{t.hero.kicker}</span>
            <h1>{t.hero.title}</h1>
            <p className="info-hero__subtitle">{t.hero.subtitle}</p>
            <p className="info-hero__body">{t.hero.body}</p>
            <div className="info-hero__actions">
              <a href="#notice">{t.hero.primary}<ArrowRight size={16} /></a>
              <a href="#tools">{t.hero.secondary}</a>
            </div>
          </div>
          <div className="info-hero__side reveal">
            <div className="status-panel">
              <span>{t.hero.status}</span>
              <strong>{t.hero.statusValue}</strong>
            </div>
            <HeroDiagram />
          </div>
        </section>

        <NoticeBoard copy={t} />
        <InfoModules copy={t} />

        <section id="tools" className="info-section tool-section reveal">
          <div className="section-heading section-heading--wide">
            <div>
              <span>{t.tools.label}</span>
              <h2>{t.tools.title}</h2>
            </div>
            <p>{t.tools.body}</p>
          </div>
          <ToolArchive />
          <a className="tool-section__all" href="/utils">{t.tools.openAll}<ArrowRight size={16} /></a>
        </section>
      </main>

      <Footer />
    </div>
  )
}
