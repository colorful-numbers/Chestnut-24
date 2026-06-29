import Head from 'next/head'
import Navbar from '../navbar'
import CharacterDisplay from '../../components/CharacterDisplay'
import { useI18n } from '../../lib/i18n'
import { getCharacters } from '../../data/characters/index.js'
import { getDefinitions } from '../../lib/definitions'

export async function getStaticPaths() {
  return {
    paths: getCharacters().map((character) => ({ params: { id: character.id } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const character = getCharacters().find((item) => item.id === params.id) || null
  return {
    props: {
      character,
      definitions: getDefinitions(),
    },
  }
}

export default function CharacterPage({ character, definitions }) {
  const { locale, t } = useI18n()

  if (!character) return null

  const copy = character.locales?.[locale] || character.locales?.zh

  return (
    <div className="info-site character-route">
      <Head>
        <title>{copy.title} - {t.metaTitle}</title>
        <meta name="description" content={copy.body} />
      </Head>
      <Navbar />
      <h1 className="visually-hidden">{copy.title}</h1>
      <main>
        <CharacterDisplay
          key={`${character.id}-${locale}`}
          character={character}
          locale={locale}
          definitions={definitions}
          autoOpen
          fullscreen
          backHref="/cast"
        />
      </main>
    </div>
  )
}
