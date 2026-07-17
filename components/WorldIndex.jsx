import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const MEDIA_BY_SLUG = {
  miracle: '/story-media/fragment-compute.png',
  'symmetric-freedom': '/story-media/fragment-awake.png',
  'surface-grid': '/story-media/hero-layer-settlement.png',
  'sylph-corridor': '/story-media/fragment-ballons.png',
}

const FEATURED_SLUGS = ['miracle', 'symmetric-freedom', 'surface-grid', 'sylph-corridor']

export default function WorldIndex({ copy, locale, definitions }) {
  const featured = FEATURED_SLUGS
    .map((slug) => definitions.find((definition) => definition.slug === slug))
    .filter(Boolean)

  return (
    <section id="world-index" className="world-index" aria-labelledby="world-index-title">
      <div className="game-section-heading game-section-heading--dark">
        <div>
          <span>{copy.label}</span>
          <h2 id="world-index-title">{copy.title}</h2>
        </div>
        <p>{copy.body}</p>
      </div>

      <div className="world-index__grid">
        {featured.map((definition, index) => {
          const definitionCopy = definition[locale] || definition.zh
          return (
            <Link
              key={definition.slug}
              href={`/defn#${definition.slug}`}
              className={`world-index__item ${definition.slug === 'surface-grid' ? 'world-index__item--diagram' : ''}`}
            >
              <img src={MEDIA_BY_SLUG[definition.slug]} alt="" loading="lazy" draggable="false" />
              <span className="world-index__shade" aria-hidden="true" />
              <span className="world-index__number">W-{String(index + 1).padStart(2, '0')}</span>
              <div>
                <span>{copy.entryLabel}</span>
                <h3>{definitionCopy.title}</h3>
                <p>{definitionCopy.summary}</p>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          )
        })}
      </div>

      <Link className="world-index__all" href="/defn">
        {copy.more}
        <ArrowUpRight size={17} />
      </Link>
    </section>
  )
}
