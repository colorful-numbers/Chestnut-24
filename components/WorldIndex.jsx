import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const MEDIA_BY_SLUG = {
  miracle: '/story-media/fragment-compute.png',
  'sylph-corridor': '/story-media/fragment-ballons.png',
  hibernation: '/story-media/fragment-awake.png',
  forgetting: '/story-media/fragment-street.png',
}

const FEATURED_SLUGS = ['miracle', 'sylph-corridor', 'hibernation', 'forgetting']

export default function WorldIndex({ copy, locale, definitions }) {
  const featured = FEATURED_SLUGS
    .map((slug) => definitions.find((definition) => definition.slug === slug))
    .filter(Boolean)

  return (
    <section id="world-index" className="world-index" aria-labelledby="world-index-title">
      <div className="game-section-heading game-section-heading--dark">
        <div>
          <h2 id="world-index-title">{copy.title}</h2>
        </div>
      </div>

      <div className="world-index__grid">
        {featured.map((definition) => {
          const definitionCopy = definition[locale] || definition.zh
          return (
            <Link
              key={definition.slug}
              href={`/defn#${definition.slug}`}
              className="world-index__item"
            >
              <img src={MEDIA_BY_SLUG[definition.slug]} alt="" loading="lazy" draggable="false" />
              <span className="world-index__shade" aria-hidden="true" />
              <div>
                <h3>{definitionCopy.title}</h3>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          )
        })}
      </div>

      <Link className="world-index__all" href="/defn">
        {copy.more || copy.title}
        <ArrowUpRight size={17} />
      </Link>
    </section>
  )
}
