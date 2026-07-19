'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { EFFECTS } from '../lib/effects'

// Elements that fade/expand into view as they are scrolled to.
const REVEAL_SELECTORS = [
  '.info-hero__copy',
  '.section-heading',
  '.game-section-heading',
  '.story-carousel__card',
  '.character-card',
  '.card-list__item',
  '.defn-card',
  '.dev-note',
  '.info-module-card',
  '.story-post__body',
  '.privacy-body > section',
  '.character-gateway__stage',
  '.world-index__item',
  '.cast-dossier',
]

const PARALLAX_SELECTORS = [
  '.story-carousel__card > img',
  '.world-index__item > img',
  '.card-list__media > img',
  '.story-post__hero > img',
]

const STAGGER_STEP_MS = 60
const WORLD_NODES = [
  { x: 8, y: 18, size: 6, delay: -2 },
  { x: 18, y: 68, size: 3, delay: -8 },
  { x: 31, y: 38, size: 5, delay: -4 },
  { x: 43, y: 82, size: 4, delay: -11 },
  { x: 57, y: 14, size: 3, delay: -6 },
  { x: 66, y: 55, size: 7, delay: -1 },
  { x: 78, y: 29, size: 4, delay: -9 },
  { x: 88, y: 76, size: 5, delay: -5 },
  { x: 95, y: 44, size: 3, delay: -12 },
]

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function SiteEffects() {
  const router = useRouter()

  // H + I: reveal on scroll, with a short deterministic sequence.
  useEffect(() => {
    if (!EFFECTS.scrollReveal) return undefined

    let observer
    const setup = () => {
      observer?.disconnect()
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer.unobserve(entry.target)
          }
        })
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })

      const viewportBottom = window.innerHeight * 0.9
      const seen = new Set()
      let revealIndex = 0
      REVEAL_SELECTORS.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          if (seen.has(el) || el.classList.contains('fx-reveal')) return
          seen.add(el)
          el.classList.add('fx-reveal')
          if (EFFECTS.cardStagger) {
            el.style.setProperty('--reveal-delay', `${(revealIndex % 6) * STAGGER_STEP_MS}ms`)
          }
          revealIndex += 1
          if (el.getBoundingClientRect().top < viewportBottom) {
            // Already in view on load: play the intro once on the next frame.
            window.requestAnimationFrame(() => el.classList.add('is-revealed'))
          } else {
            observer.observe(el)
          }
        })
      })
    }

    const timer = window.setTimeout(setup, 0)
    router.events.on('routeChangeComplete', setup)
    return () => {
      window.clearTimeout(timer)
      router.events.off('routeChangeComplete', setup)
      observer?.disconnect()
    }
  }, [router.events])

  // J: move the world-field geometry with the pointer. This is intentionally
  // directional rather than luminous, so it never behaves like a spotlight.
  useEffect(() => {
    if (!EFFECTS.worldScene || prefersReducedMotion()) return undefined

    const root = document.documentElement
    let frame = 0
    const onMove = (event) => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const x = (event.clientX / window.innerWidth - 0.5) * 2
        const y = (event.clientY / window.innerHeight - 0.5) * 2
        root.style.setProperty('--world-x', `${(x * 22).toFixed(2)}px`)
        root.style.setProperty('--world-y', `${(y * 16).toFixed(2)}px`)
        root.style.setProperty('--world-x-inverse', `${(x * -13).toFixed(2)}px`)
        root.style.setProperty('--world-y-inverse', `${(y * -9).toFixed(2)}px`)
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (frame) window.cancelAnimationFrame(frame)
      root.style.removeProperty('--world-x')
      root.style.removeProperty('--world-y')
      root.style.removeProperty('--world-x-inverse')
      root.style.removeProperty('--world-y-inverse')
    }
  }, [])

  // K: nearby media moves more slowly than the page, creating depth between
  // each image and its frame without changing layout or intercepting input.
  useEffect(() => {
    if (!EFFECTS.mediaParallax) return undefined

    let media = []
    let frame = 0

    const collectMedia = () => {
      media = PARALLAX_SELECTORS.flatMap((selector) => (
        Array.from(document.querySelectorAll(selector))
      ))
      media.forEach((element) => element.classList.add('fx-depth-media'))
      requestUpdate()
    }

    const updateMedia = () => {
      frame = 0
      const viewportCenter = window.innerHeight / 2
      media.forEach((element) => {
        const rect = element.getBoundingClientRect()
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return
        const center = rect.top + rect.height / 2
        const progress = Math.max(-1, Math.min(1, (viewportCenter - center) / window.innerHeight))
        const motionScale = prefersReducedMotion() ? 0.45 : 1
        element.style.setProperty('--media-shift', `${(progress * 34 * motionScale).toFixed(2)}px`)
      })
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateMedia)
    }

    const timer = window.setTimeout(collectMedia, 0)
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    router.events.on('routeChangeComplete', collectMedia)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      router.events.off('routeChangeComplete', collectMedia)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [router.events])

  if (!EFFECTS.worldScene) return null

  return (
    <div className="world-scene" aria-hidden="true">
      <div className="world-scene__grid" />
      <div className="world-scene__orbit world-scene__orbit--one" />
      <div className="world-scene__orbit world-scene__orbit--two" />
      <div className="world-scene__path" />
      <div className="world-scene__nodes">
        {WORLD_NODES.map((node) => (
          <span
            key={`${node.x}-${node.y}`}
            style={{
              '--node-x': `${node.x}%`,
              '--node-y': `${node.y}%`,
              '--node-size': `${node.size}px`,
              '--node-delay': `${node.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
