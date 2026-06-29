'use client'

import Head from 'next/head'
import Navbar from './navbar'
import Footer from './footer'
import { useI18n } from '../lib/i18n'

export default function Privacy() {
  const { t } = useI18n()
  const p = t.privacy

  return (
    <div className="info-site min-h-screen flex flex-col">
      <Head>
        <title>{p.title} - {t.metaTitle}</title>
        <meta name="description" content={p.intro} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />
      <main>
        <section className="info-section defn-page">
          <div className="section-heading section-heading--wide">
            <div>
              <span>{p.label}</span>
              <h1>{p.title}</h1>
            </div>
            <p>{p.intro}</p>
          </div>
          <div className="privacy-body">
            <p className="privacy-body__updated">{p.updated}</p>
            {p.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
