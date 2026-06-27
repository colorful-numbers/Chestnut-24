import Link from 'next/link'
import Carousel from './Carousel'
import DefinitionText from './DefinitionText'

export default function CharacterCarousel({ label, title, body, locale, characters, definitions = [], moreLabel, moreHref = '/cast' }) {
  return (
    <section id="system" className="info-section character-carousel-section">
      <div className="section-heading section-heading--wide section-heading--linked">
        <div>
          <span>{label}</span>
          <h2>{title}</h2>
        </div>
        <p>{body}</p>
        {moreLabel && (
          <Link className="section-heading__more" href={moreHref}>{moreLabel}</Link>
        )}
      </div>
      <Carousel
        ariaLabel={title}
        items={characters}
        className="character-carousel"
        renderItem={(character, _index, isClone) => {
          const copy = character.locales?.[locale] || character.locales?.zh || character[locale] || character.zh
          return (
            <Link
              href={`/cast/${character.id}`}
              className="story-carousel__card character-card"
              tabIndex={isClone ? -1 : undefined}
              draggable="false"
            >
              <img
                src={character.mainCg}
                alt=""
                loading={isClone ? 'eager' : 'lazy'}
                draggable="false"
              />
              <div className="story-carousel__copy">
                <span>{copy.label}</span>
                <h3>{copy.title}</h3>
                <p><DefinitionText definitions={definitions}>{copy.body}</DefinitionText></p>
              </div>
            </Link>
          )
        }}
      />
    </section>
  )
}
