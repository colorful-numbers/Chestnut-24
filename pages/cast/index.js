import Head from 'next/head'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Navbar from '../navbar'
import Footer from '../footer'
import DefinitionText from '../../components/DefinitionText'
import { useI18n } from '../../lib/i18n'
import { getCharacters } from '../../data/characters/index.js'
import { getDefinitions } from '../../lib/definitions'

export async function getStaticProps() {
  return {
    props: {
      definitions: getDefinitions(),
      characters: getCharacters(),
    },
  }
}

export default function CastPage({ definitions, characters }) {
  const { locale, t } = useI18n()

  return (
    <div className="info-site min-h-screen flex flex-col">
      <Head>
        <title>{`${t.system.title} - ${t.metaTitle}`}</title>
        <meta name="description" content={t.system.pageBody} />
      </Head>
      <Navbar />
      <main>
        <section className="cast-archive">
          <div className="game-section-heading cast-archive__heading">
            <div>
              <span>{t.system.label}</span>
              <h1>{t.system.title}</h1>
            </div>
            <p>{t.system.pageBody}</p>
          </div>
          <div className="cast-dossiers">
            {characters.map((character) => {
              const copy = character.locales?.[locale] || character.locales?.zh || character[locale] || character.zh
              return (
                <Link key={character.id} href={`/cast/${character.id}`} className="cast-dossier">
                  <div className="cast-dossier__media">
                    <img src={character.mainCg} alt="" loading="lazy" draggable="false" />
                  </div>
                  <div className="cast-dossier__copy">
                    <h2>{copy.title}</h2>
                    <p><DefinitionText definitions={definitions}>{copy.body}</DefinitionText></p>
                    <span className="cast-dossier__cta">{t.system.enter}<ArrowRight size={17} /></span>
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
