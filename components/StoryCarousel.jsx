import { useEffect, useState } from 'react'
import Link from 'next/link'
import Carousel from './Carousel'
import DefinitionText from './DefinitionText'

function pickRandomStories(stories, count) {
  const shuffled = [...stories]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export default function StoryCarousel({ label, title, locale, stories, definitions = [], maxItems = 5, moreLabel, moreHref = '/fragments' }) {
  const [selectedStories, setSelectedStories] = useState(() => stories.slice(0, maxItems))

  useEffect(() => {
    setSelectedStories(pickRandomStories(stories, maxItems))
  }, [maxItems, stories])

  return (
    <section id="notice" className="info-section story-carousel-section">
      <div className="section-heading section-heading--linked">
        <div>
          <span>{label}</span>
          <h2>{title}</h2>
        </div>
        {moreLabel && (
          <Link className="section-heading__more" href={moreHref}>{moreLabel}</Link>
        )}
      </div>
      <Carousel
        ariaLabel={title}
        items={selectedStories}
        className="story-carousel"
        renderItem={(story, _index, isClone) => {
          const storyCopy = story[locale] || story.zh
          return (
            <Link
              href={`/fragments/${story.id}`}
              className="story-carousel__card"
              tabIndex={isClone ? -1 : undefined}
              draggable="false"
            >
              <img
                src={story.media}
                alt=""
                loading={isClone ? 'eager' : 'lazy'}
                draggable="false"
              />
              <div className="story-carousel__copy">
                <time>{story.time}</time>
                <span>{storyCopy.kicker}</span>
                <h3>{storyCopy.title}</h3>
                <p><DefinitionText definitions={definitions}>{storyCopy.body}</DefinitionText></p>
              </div>
            </Link>
          )
        }}
      />
    </section>
  )
}
