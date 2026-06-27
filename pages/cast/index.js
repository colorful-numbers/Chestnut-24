import Head from 'next/head'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Navbar from '../navbar'
import Footer from '../footer'
import DefinitionText from '../../components/DefinitionText'
import { useI18n } from '../../lib/i18n'
import { characters } from '../../data/characters/index.js'
import { getDefinitions } from '../../lib/definitions'

export async function getStaticProps() {
  return {
    props: {
      definitions: getDefinitions(),
    },
  }
}

export default function CastPage({ definitions }) {
  const { locale, t } = useI18n()

  return (
    <div className="info-site min-h-screen flex flex-col">
      <Head>
        <title>{t.system.title} - {t.metaTitle}</title>
        <meta name="description" content={t.system.pageBody} />
      </Head>
      <Navbar />
      <main>
        <section className="info-section defn-page">
          <div className="section-heading section-heading--wide">
            <div>
              <span>{t.system.label}</span>
              <h1>{t.system.title}</h1>
            </div>
            <p>{t.system.pageBody}</p>
          </div>
          <div className="card-list">
            {characters.map((character) => {
              const copy = character.locales?.[locale] || character.locales?.zh || character[locale] || character.zh
              return (
                <Link key={character.id} href={`/cast/${character.id}`} className="card-list__item">
                  <div className="card-list__media">
                    <img src={character.mainCg} alt="" loading="lazy" draggable="false" />
                  </div>
                  <div className="card-list__copy">
                    <span>{copy.label}</span>
                    <h2>{copy.title}</h2>
                    <p><DefinitionText definitions={definitions}>{copy.body}</DefinitionText></p>
                    <span className="card-list__cta">{t.system.enter}<ArrowRight size={15} /></span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
