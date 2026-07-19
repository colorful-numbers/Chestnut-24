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

      hero.style.setProperty('--hero-shift-sky', `${progress * 118}px`)
      hero.style.setProperty('--hero-shift-settlement', `${progress * 42}px`)
      hero.style.setProperty('--hero-shift-land', `${progress * -86}px`)
      hero.style.setProperty('--hero-copy-shift', `${progress * -52}px`)
      hero.style.setProperty('--hero-fade', `${1 - progress * 0.82}`)
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateLayers)
    }

    const onPointerMove = (event) => {
      const rect = hero.getBoundingClientRect()
      const x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
      const y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1)
      hero.style.setProperty('--hero-x-base', `${(x * -5).toFixed(2)}px`)
      hero.style.setProperty('--hero-y-base', `${(y * -4).toFixed(2)}px`)
      hero.style.setProperty('--hero-x-sky', `${(x * 11).toFixed(2)}px`)
      hero.style.setProperty('--hero-y-sky', `${(y * 8).toFixed(2)}px`)
      hero.style.setProperty('--hero-x-mid', `${(x * -13).toFixed(2)}px`)
      hero.style.setProperty('--hero-y-mid', `${(y * -7).toFixed(2)}px`)
      hero.style.setProperty('--hero-x-near', `${(x * 18).toFixed(2)}px`)
      hero.style.setProperty('--hero-y-near', `${(y * 12).toFixed(2)}px`)
      hero.style.setProperty('--hero-x-copy', `${(x * -7).toFixed(2)}px`)
      hero.style.setProperty('--hero-y-copy', `${(y * -4).toFixed(2)}px`)
    }

    const resetPointer = () => {
      ;[
        '--hero-x-base', '--hero-y-base', '--hero-x-sky', '--hero-y-sky',
        '--hero-x-mid', '--hero-y-mid', '--hero-x-near', '--hero-y-near',
        '--hero-x-copy', '--hero-y-copy',
      ].forEach((property) => hero.style.setProperty(property, '0px'))
    }

    updateLayers()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    hero.addEventListener('pointermove', onPointerMove, { passive: true })
    hero.addEventListener('pointerleave', resetPointer)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      hero.removeEventListener('pointermove', onPointerMove)
      hero.removeEventListener('pointerleave', resetPointer)
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
        <div className="world-hero__haze" />
        <div className="world-hero__orbits">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="world-hero__copy">
        <span className="world-hero__kicker">{copy.kicker}</span>
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
