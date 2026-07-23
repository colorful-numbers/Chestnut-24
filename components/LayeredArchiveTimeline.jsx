import { useCallback, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import AnimationContainer from './AnimationContainer'
import AnimatedText from './AnimatedText'

const sceneWindow = (index, count) => {
  const segment = 1 / Math.max(count, 1)
  const center = (index + 0.5) * segment
  const overlap = Math.min(0.045, segment * 0.25)

  return {
    '--scene-start': index === 0 ? -0.1 : center - segment / 2 - overlap,
    '--scene-end': index === count - 1 ? 1.1 : center + segment / 2 + overlap,
    '--scene-center': center,
    '--scene-index': index,
  }
}

export default function LayeredArchiveTimeline({
  id,
  variant,
  title,
  items,
  moreLabel,
  moreHref,
  height,
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const handleProgress = useCallback((progress) => {
    const nextIndex = Math.min(
      items.length - 1,
      Math.max(0, Math.floor(progress * items.length)),
    )
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex))
  }, [items.length])

  if (!items.length) return null

  return (
    <section id={id} className={`archive-timeline archive-timeline--${variant}`}>
      <AnimationContainer
        height={height}
        labelledBy={`${id}-title`}
        onProgress={handleProgress}
      >
        <div className="archive-timeline__stage">
          <header className="archive-timeline__heading">
            <AnimatedText as="h2" id={`${id}-title`} start={0.01}>
              {title}
            </AnimatedText>
          </header>

          <div className="archive-timeline__scenes">
            {items.map((item, index) => {
              const segmentStart = index / items.length
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`archive-scene ${index === activeIndex ? 'is-active' : ''}`}
                  style={sceneWindow(index, items.length)}
                  tabIndex={index === activeIndex ? undefined : -1}
                  aria-hidden={index === activeIndex ? undefined : 'true'}
                >
                  <div className="archive-scene__media" aria-hidden="true">
                    <img className="archive-scene__layer archive-scene__layer--far" src={item.media} alt="" />
                    <img className="archive-scene__layer archive-scene__layer--mid" src={item.media} alt="" />
                    <img className="archive-scene__layer archive-scene__layer--near" src={item.media} alt="" />
                  </div>
                  <div className="archive-scene__copy">
                    <AnimatedText
                      as="h3"
                      start={segmentStart + 0.015}
                      step={0.004}
                    >
                      {item.title}
                    </AnimatedText>
                    {item.hook && (
                      <AnimatedText
                        as="p"
                        start={segmentStart + 0.055}
                        step={0.0025}
                      >
                        {item.hook}
                      </AnimatedText>
                    )}
                    <ArrowUpRight aria-hidden="true" />
                  </div>
                </Link>
              )
            })}
          </div>

          {moreLabel && (
            <Link className="archive-timeline__more" href={moreHref}>
              <AnimatedText start={0.82} step={0.004}>{moreLabel}</AnimatedText>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          )}
        </div>
      </AnimationContainer>
    </section>
  )
}
