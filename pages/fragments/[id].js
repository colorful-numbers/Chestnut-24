import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Navbar from '../navbar'
import Footer from '../footer'
import DefinitionText from '../../components/DefinitionText'
import { useI18n } from '../../lib/i18n'
import { getDefinitions } from '../../lib/definitions'
import { getSideStories } from '../../lib/sideStories'

export async function getStaticPaths() {
  return {
    paths: getSideStories().map((story) => ({ params: { id: story.id } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const story = getSideStories().find((item) => item.id === params.id) || null
  return {
    props: {
      story,
      definitions: getDefinitions(),
    },
  }
}

export default function FragmentPage({ story, definitions }) {
  const { locale, t } = useI18n()

  if (!story) return null

  const copy = story[locale] || story.zh
  const paragraphs = Array.isArray(copy.article) ? copy.article : [copy.body]

  return (
    <div className="info-site min-h-screen flex flex-col">
      <Head>
        <title>{copy.title} - {t.metaTitle}</title>
        <meta name="description" content={copy.body} />
      </Head>
      <Navbar />
      <main>
        <article className="info-section story-post">
          <Link href="/fragments" className="story-post__back">
            <ArrowLeft size={15} />{t.notice.back}
          </Link>
          <div
            className="story-post__hero"
            style={{ backgroundImage: `url('${story.media}')` }}
          >
            <div className="story-post__hero-copy">
              <span>{copy.kicker}</span>
              <h1>{copy.title}</h1>
              <time>{story.time}</time>
            </div>
          </div>
          <div className="story-post__body">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>
                <DefinitionText definitions={definitions}>{paragraph}</DefinitionText>
              </p>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
