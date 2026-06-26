import Head from 'next/head'
import { ArrowRight } from 'lucide-react'
import Navbar from './navbar'
import Footer from './footer'
import StoryCarousel from '../components/StoryCarousel'
import CharacterCarousel from '../components/CharacterCarousel'
import { useI18n } from '../lib/i18n'
import { sideStories } from '../data/sideStories'
import { characters } from '../data/characters/index.js'

export default function Home() {
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
        <section
          id="overview"
          className="info-hero"
          style={{ backgroundImage: `url('${t.hero.media}')` }}
        >
          <div className="info-hero__copy">
            <span>{t.hero.kicker}</span>
            <h1>{t.hero.title}</h1>
            <p className="info-hero__subtitle">{t.hero.subtitle}</p>
            <p className="info-hero__body">{t.hero.body}</p>
            <div className="info-hero__actions">
              <a href="#notice">{t.hero.primary}<ArrowRight size={16} /></a>
              <a href="#system">{t.hero.secondary}</a>
            </div>
          </div>
        </section>

        <StoryCarousel
          label={t.notice.label}
          title={t.notice.title}
          locale={locale}
          stories={sideStories}
          maxItems={5}
        />
        <CharacterCarousel
          label={t.system.label}
          title={t.system.title}
          body={t.system.body}
          locale={locale}
          characters={characters}
        />
      </main>

      <Footer />
    </div>
  )
}
