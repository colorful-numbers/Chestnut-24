import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight } from 'lucide-react'
import AnimatedText from './AnimatedText'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export default function LayeredWorldHero({ copy }) {
  const heroRef = useRef(null)

  useEffect(() => {
    const hero = heroRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    if (!hero) return undefined

    let frame = 0
    let mounted = true
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
      const progress = clamp(-rect.top / Math.max(rect.height, 1), 0, 1)
      const textProgress = clamp(0.34 + progress * 0.66, 0, 1)

      hero.style.setProperty('--animation-progress', textProgress.toFixed(4))
      hero.style.setProperty('--hero-progress', progress.toFixed(4))
      hero.style.setProperty('--hero-shift-background', `${progress * -18}px`)
      hero.style.setProperty('--hero-shift-balloons', `${progress * -74}px`)
      hero.style.setProperty('--hero-shift-foreground', `${progress * -138}px`)
      hero.style.setProperty('--hero-copy-shift', `${progress * -84}px`)
      hero.style.setProperty('--hero-fade', `${1 - progress * 0.82}`)
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
    }
  }, [])

  return (
    <section id="overview" className="world-hero" ref={heroRef}>
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
    </section>
  )
}
