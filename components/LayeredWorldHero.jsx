import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'
import DefinitionText from './DefinitionText'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export default function LayeredWorldHero({ copy, definitions }) {
  const heroRef = useRef(null)

  useEffect(() => {
    const hero = heroRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (!hero || reduceMotion.matches) return undefined

    let frame = 0

    const updateLayers = () => {
      frame = 0
      const rect = hero.getBoundingClientRect()
      const progress = clamp(-rect.top / Math.max(rect.height, 1), 0, 1)

      hero.style.setProperty('--hero-shift-sky', `${progress * 28}px`)
      hero.style.setProperty('--hero-shift-settlement', `${progress * 8}px`)
      hero.style.setProperty('--hero-shift-land', `${progress * -20}px`)
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateLayers)
    }

    updateLayers()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section id="overview" className="world-hero" ref={heroRef}>
      <div className="world-hero__layers" aria-hidden="true">
        <img className="world-hero__layer world-hero__layer--sky" src={copy.layers.sky} alt="" />
        <img
          className="world-hero__layer world-hero__layer--settlement"
          src={copy.layers.settlement}
          alt=""
        />
        <img className="world-hero__layer world-hero__layer--land" src={copy.layers.land} alt="" />
      </div>

      <div className="world-hero__history" aria-label={copy.timelineLabel}>
        <span>{copy.timelineLabel}</span>
        <ol>
          {copy.timeline.map((entry) => (
            <li key={entry.time}>
              <time>{entry.time}</time>
              <span>{entry.text}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="world-hero__copy">
        <span className="world-hero__kicker">{copy.kicker}</span>
        <h1>{copy.title}</h1>
        <p className="world-hero__subtitle">{copy.subtitle}</p>
        <p className="world-hero__body">
          <DefinitionText definitions={definitions}>{copy.body}</DefinitionText>
        </p>
        <div className="world-hero__actions">
          <Link href="/cast/artifact101" className="game-primary-action">
            <span>
              <small>{copy.primaryHint}</small>
              {copy.primary}
            </span>
            <ArrowRight size={20} />
          </Link>
          <a href="#cast-entry" className="world-hero__secondary">
            {copy.secondary}
            <ArrowDown size={17} />
          </a>
        </div>
      </div>

      <div className="world-hero__footer" aria-hidden="true">
        <span>{copy.chapter}</span>
        <span>{copy.coordinate}</span>
        <span>{copy.signal}</span>
      </div>
    </section>
  )
}
