import Carousel from './Carousel'
import CharacterDisplay from './CharacterDisplay'

export default function CharacterCarousel({ label, title, body, locale, characters }) {
  return (
    <section id="system" className="info-section character-carousel-section">
      <div className="section-heading section-heading--wide">
        <div>
          <span>{label}</span>
          <h2>{title}</h2>
        </div>
        <p>{body}</p>
      </div>
      <Carousel
        ariaLabel={title}
        items={characters}
        className="character-carousel"
        renderItem={(character) => (
          <CharacterDisplay character={character} locale={locale} />
        )}
      />
    </section>
  )
}
