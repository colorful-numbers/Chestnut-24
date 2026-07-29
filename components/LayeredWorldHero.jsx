import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'
import AnimatedText from './AnimatedText'
import { createAnimationClock } from '../lib/animationClock'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export default function LayeredWorldHero({ copy }) {
  const heroRef = useRef(null)

  useEffect(() => {
    const hero = heroRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (!hero) return undefined

    let frame = 0
    let mounted = true
    const textClock = createAnimationClock(hero, {
      property: '--text-time-progress',
      enterDuration: 1800,
      exitDuration: 520,
      initialValue: 0.08,
    })
    const layerImages = Array.from(hero.querySelectorAll('.world-hero__layer'))
    const waitForLayer = (image) => {
      if (image.complete) {
        return image.naturalWidth > 0 ? Promise.resolve() : Promise.reject(new Error('Hero layer failed to load'))
      }
      return new Promise((resolve, reject) => {
        image.addEventListener('load', resolve, { once: true })
        image.addEventListener('error', reject, { once: true })
      })
    }
    Promise.all(layerImages.map(waitForLayer)).then(() => {
      if (mounted) hero.classList.add('is-layered')
    }).catch(() => {})

    const updateLayers = () => {
      frame = 0
      const rect = hero.getBoundingClientRect()
      const scrollRange = Math.max(rect.height - window.innerHeight, 1)
      const progress = clamp(-rect.top / scrollRange, 0, 1)
      const easedProgress = progress * progress * (3 - 2 * progress)
      const copyFade = 1 - clamp((progress - 0.32) / 0.34, 0, 1)
      const artFade = 1 - clamp((progress - 0.72) / 0.24, 0, 1)
      const whiteout = clamp((progress - 0.66) / 0.3, 0, 1)
      const baseFocusY = window.innerWidth / window.innerHeight > 1.6 ? 66 : 58
      const isActive = rect.top < window.innerHeight * 0.8
        && rect.bottom > window.innerHeight * 0.2

      hero.style.setProperty('--animation-progress', progress.toFixed(4))
      hero.style.setProperty('--hero-progress', progress.toFixed(4))
      hero.style.setProperty('--hero-shift-background', `${easedProgress * -24}px`)
      hero.style.setProperty('--hero-shift-balloons', `${easedProgress * -108}px`)
      hero.style.setProperty('--hero-shift-foreground', `${easedProgress * -196}px`)
      hero.style.setProperty('--hero-scale-background', (1.08 - easedProgress * 0.055).toFixed(4))
      hero.style.setProperty('--hero-scale-balloons', (1.1 + easedProgress * 0.04).toFixed(4))
      hero.style.setProperty('--hero-scale-foreground', (1.08 + easedProgress * 0.11).toFixed(4))
      hero.style.setProperty('--hero-focus-y', `${baseFocusY + easedProgress * 7}%`)
      hero.style.setProperty('--hero-copy-shift', `${easedProgress * -108}px`)
      hero.style.setProperty('--hero-copy-opacity', copyFade.toFixed(4))
      hero.style.setProperty('--hero-art-opacity', artFade.toFixed(4))
      hero.style.setProperty('--hero-whiteout', whiteout.toFixed(4))
      textClock.setTarget(isActive ? 1 : 0)
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateLayers)
    }

    const onPointerMove = (event) => {
      const rect = hero.getBoundingClientRect()
      const x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1)
      const y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1)
      const pointerScale = reduceMotion.matches ? 0.35 : 1
      hero.style.setProperty('--hero-x-background', `${(x * -4 * pointerScale).toFixed(2)}px`)
      hero.style.setProperty('--hero-y-background', `${(y * -3 * pointerScale).toFixed(2)}px`)
      hero.style.setProperty('--hero-x-balloons', `${(x * 16 * pointerScale).toFixed(2)}px`)
      hero.style.setProperty('--hero-y-balloons', `${(y * 10 * pointerScale).toFixed(2)}px`)
      hero.style.setProperty('--hero-x-foreground', `${(x * 28 * pointerScale).toFixed(2)}px`)
      hero.style.setProperty('--hero-y-foreground', `${(y * 18 * pointerScale).toFixed(2)}px`)
      hero.style.setProperty('--hero-x-copy', `${(x * -7 * pointerScale).toFixed(2)}px`)
      hero.style.setProperty('--hero-y-copy', `${(y * -4 * pointerScale).toFixed(2)}px`)
    }

    const resetPointer = () => {
      ;[
        '--hero-x-background', '--hero-y-background',
        '--hero-x-balloons', '--hero-y-balloons',
        '--hero-x-foreground', '--hero-y-foreground',
        '--hero-x-copy', '--hero-y-copy',
      ].forEach((property) => hero.style.setProperty(property, '0px'))
    }

    updateLayers()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    hero.addEventListener('pointermove', onPointerMove, { passive: true })
    hero.addEventListener('pointerleave', resetPointer)

    return () => {
      mounted = false
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      hero.removeEventListener('pointermove', onPointerMove)
      hero.removeEventListener('pointerleave', resetPointer)
      if (frame) window.cancelAnimationFrame(frame)
      textClock.destroy()
    }
  }, [])

  return (
    <section id="overview" className="world-hero" ref={heroRef}>
      <div className="world-hero__sticky">
        <div className="world-hero__layers" aria-hidden="true">
          <img className="world-hero__fallback" src={copy.image} alt="" loading="eager" fetchpriority="high" decoding="sync" />
          <img className="world-hero__layer world-hero__layer--background" src={copy.layers?.background || copy.image} alt="" loading="eager" fetchpriority="high" decoding="sync" />
          <img className="world-hero__layer world-hero__layer--balloons" src={copy.layers?.balloons || copy.image} alt="" loading="eager" decoding="sync" />
          <img className="world-hero__layer world-hero__layer--foreground" src={copy.layers?.foreground || copy.image} alt="" loading="eager" decoding="sync" />
          <div className="world-hero__haze" />
        </div>

        <div className="world-hero__copy">
          <AnimatedText as="span" className="world-hero__kicker" start={0.01}>
            {copy.kicker}
          </AnimatedText>
          <AnimatedText as="h1" start={0.035} step={0.009}>
            {copy.title}
          </AnimatedText>
          <AnimatedText as="p" className="world-hero__subtitle" start={0.1} step={0.004}>
            {copy.subtitle}
          </AnimatedText>
          <div className="world-hero__actions">
            <Link href={copy.primaryHref || '/fragments'} className="game-primary-action">
              <AnimatedText start={0.16} step={0.004}>{copy.primary}</AnimatedText>
              <ArrowRight size={20} />
            </Link>
            <a href={copy.secondaryHref || '#cast-entry'} className="world-hero__secondary">
              <AnimatedText start={0.19} step={0.004}>{copy.secondary}</AnimatedText>
              <ArrowDown size={17} />
            </a>
          </div>
        </div>
        <div className="world-hero__soft-exit" aria-hidden="true" />
      </div>
    </section>
  )
}
