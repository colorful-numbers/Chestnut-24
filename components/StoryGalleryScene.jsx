import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import AnimatedText from './AnimatedText'

const WALLS = ['north', 'east', 'south', 'west']
const FORMATS = ['landscape', 'portrait', 'wide']

function GalleryArtwork({ item, position, format }) {
  if (!item) return null

  return (
    <div
      className={`gallery-room__artwork gallery-room__artwork--${position} gallery-room__artwork--${format}`}
      aria-hidden={position === 'active' ? undefined : 'true'}
    >
      <img className="gallery-room__art-layer gallery-room__art-layer--far" src={item.media} alt="" />
      <img className="gallery-room__art-layer gallery-room__art-layer--mid" src={item.media} alt="" />
      <img className="gallery-room__art-layer gallery-room__art-layer--near" src={item.media} alt="" />
    </div>
  )
}

export default function StoryGalleryScene({
  item,
  index,
  title,
  headingId,
  moreLabel,
  moreHref,
  previousItem,
  nextItem,
  controls,
  direction,
}) {
  const wall = WALLS[index % WALLS.length]
  const format = FORMATS[index % FORMATS.length]

  return (
    <article
      className="gallery-room"
      data-wall={wall}
      data-direction={direction > 0 ? 'forward' : 'backward'}
    >
      <div className="gallery-room__camera" aria-hidden="true">
        <div className="gallery-room__shell">
          <div className="gallery-room__ceiling" />
          <div className="gallery-room__floor" />
          <div className="gallery-room__wall gallery-room__wall--left" />
          <div className="gallery-room__wall gallery-room__wall--right" />
        </div>
        <GalleryArtwork item={previousItem} position="previous" format={FORMATS[(index + 2) % FORMATS.length]} />
        <GalleryArtwork item={item} position="active" format={format} />
        <GalleryArtwork item={nextItem} position="next" format={FORMATS[(index + 1) % FORMATS.length]} />
      </div>

      <header className="archive-timeline__heading">
        <AnimatedText as="h2" id={headingId} start={0.01}>{title}</AnimatedText>
      </header>

      <Link className="gallery-room__description" href={item.href}>
        <AnimatedText as="h3" start={0.1} step={0.004}>{item.title}</AnimatedText>
        {item.hook && (
          <AnimatedText as="p" start={0.45} step={0.0025}>{item.hook}</AnimatedText>
        )}
        <ArrowUpRight aria-hidden="true" />
      </Link>

      {moreLabel && (
        <Link className="archive-timeline__more" href={moreHref}>
          <AnimatedText start={0.74} step={0.004}>{moreLabel}</AnimatedText>
          <ArrowUpRight aria-hidden="true" />
        </Link>
      )}

      {controls}
      <div className="gallery-room__arrival" aria-hidden="true" />
    </article>
  )
}
