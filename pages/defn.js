import Head from 'next/head'
import Navbar from './navbar'
import Footer from './footer'
import { getDefinitions } from '../lib/definitions'
import { useI18n } from '../lib/i18n'

export async function getStaticProps() {
  return {
    props: {
      definitions: getDefinitions(),
    },
  }
}

export default function DefinitionsPage({ definitions }) {
  const { locale, t } = useI18n()

  return (
    <div className="info-site min-h-screen flex flex-col">
      <Head>
        <title>{t.defn.title} - {t.metaTitle}</title>
        <meta name="description" content={t.defn.body} />
      </Head>
      <Navbar />
      <main>
        <section className="info-section defn-page">
          <div className="section-heading section-heading--wide">
            <div>
              <span>{t.defn.label}</span>
              <h1>{t.defn.title}</h1>
            </div>
            <p>{t.defn.body}</p>
          </div>
          <div className="defn-grid">
            {definitions.map((definition) => {
              const copy = definition[locale] || definition.zh
              return (
                <article key={definition.slug} id={definition.slug} className="defn-card">
                  <span>{definition.aliases.join(' / ') || definition.slug}</span>
                  <h2>{copy.title}</h2>
                  <p>{copy.summary}</p>
                </article>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
