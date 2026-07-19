import Head from 'next/head'
import Navbar from './navbar'
import Footer from './footer'
import StoryCarousel from '../components/StoryCarousel'
import CharacterGateway from '../components/CharacterGateway'
import WorldIndex from '../components/WorldIndex'
import LayeredWorldHero from '../components/LayeredWorldHero'
import { useI18n } from '../lib/i18n'
import { getCharacters } from '../data/characters/index.js'
import { getDefinitions } from '../lib/definitions'
import { getSideStories } from '../lib/sideStories'

export async function getStaticProps() {
  return {
    props: {
      definitions: getDefinitions(),
      sideStories: getSideStories(),
      characters: getCharacters(),
    },
  }
}

export default function Home({ definitions, sideStories, characters }) {
  const { locale, t } = useI18n()

  return (
    <div className="info-site min-h-screen flex flex-col">
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <main>
        <LayeredWorldHero copy={t.hero} />

        <CharacterGateway
          copy={t.system}
          locale={locale}
          characters={characters}
        />

        <WorldIndex copy={t.defn} locale={locale} definitions={definitions} />

        <StoryCarousel
          title={t.notice.title}
          moreLabel={t.notice.more}
          hooks={t.notice.hooks}
          locale={locale}
          stories={sideStories}
          maxItems={5}
        />
      </main>

      <Footer />
    </div>
  )
}
