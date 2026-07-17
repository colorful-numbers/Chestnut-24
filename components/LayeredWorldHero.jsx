import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export default function LayeredWorldHero({ copy }) {
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

      hero.style.setProperty('--hero-shift-sky', `${progress * 74}px`)
      hero.style.setProperty('--hero-shift-settlement', `${progress * 18}px`)
      hero.style.setProperty('--hero-shift-land', `${progress * -58}px`)
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
        <img className="world-hero__layer world-hero__layer--base" src={copy.image} alt="" />
        <img className="world-hero__layer world-hero__layer--sky" src={copy.image} alt="" />
        <img className="world-hero__layer world-hero__layer--settlement" src={copy.image} alt="" />
        <img className="world-hero__layer world-hero__layer--land" src={copy.image} alt="" />
      </div>

      <div className="world-hero__copy">
        <h1>{copy.title}</h1>
        <p className="world-hero__subtitle">{copy.subtitle}</p>
        <div className="world-hero__actions">
          <Link href={copy.primaryHref || '/fragments'} className="game-primary-action">
            <span>{copy.primary}</span>
            <ArrowRight size={20} />
          </Link>
          <a href={copy.secondaryHref || '#cast-entry'} className="world-hero__secondary">
            {copy.secondary}
            <ArrowDown size={17} />
          </a>
        </div>
      </div>
    </section>
  )
}
