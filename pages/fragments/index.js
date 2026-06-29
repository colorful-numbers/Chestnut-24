import Head from 'next/head'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Navbar from '../navbar'
import Footer from '../footer'
import DefinitionText from '../../components/DefinitionText'
import { useI18n } from '../../lib/i18n'
import { getDefinitions } from '../../lib/definitions'
import { getSideStories } from '../../lib/sideStories'

export async function getStaticProps() {
  return {
    props: {
      definitions: getDefinitions(),
      sideStories: getSideStories(),
    },
  }
}

export default function FragmentsPage({ definitions, sideStories }) {
  const { locale, t } = useI18n()

  return (
    <div className="info-site min-h-screen flex flex-col">
      <Head>
        <title>{t.notice.title} - {t.metaTitle}</title>
        <meta name="description" content={t.notice.pageBody} />
      </Head>
      <Navbar />
      <main>
        <section className="info-section defn-page">
          <div className="section-heading section-heading--wide">
            <div>
              <span>{t.notice.label}</span>
              <h1>{t.notice.title}</h1>
            </div>
            <p>{t.notice.pageBody}</p>
          </div>
          <div className="card-list">
            {sideStories.map((story) => {
              const copy = story[locale] || story.zh
              return (
                <Link key={story.id} href={`/fragments/${story.id}`} className="card-list__item">
                  <div className="card-list__media">
                    <img src={story.media} alt="" loading="lazy" draggable="false" />
                  </div>
                  <div className="card-list__copy">
                    <time>{story.time}</time>
                    <span>{copy.kicker}</span>
                    <h2>{copy.title}</h2>
                    <p><DefinitionText definitions={definitions}>{copy.body}</DefinitionText></p>
                    <span className="card-list__cta">{t.notice.readMore}<ArrowRight size={15} /></span>
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
