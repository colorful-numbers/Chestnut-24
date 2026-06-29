'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { EFFECTS } from '../lib/effects'

// Elements that fade/expand into view as they are scrolled to.
const REVEAL_SELECTORS = [
  '.info-hero__copy',
  '.section-heading',
  '.story-carousel__card',
  '.character-card',
  '.card-list__item',
  '.defn-card',
  '.dev-note',
  '.tool-card',
  '.info-module-card',
  '.story-post__body',
  '.privacy-body > section',
]

// Repeated widgets that catch a cursor-following highlight.
const LIGHT_SELECTORS = [
  '.story-carousel__card',
  '.card-list__item',
  '.defn-card',
  '.tool-card',
  '.info-module-card',
  '.character-card',
  '.dev-note',
]

const STAGGER_MAX_MS = 320

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function SiteEffects() {
  const router = useRouter()

  // H + I: reveal on scroll, with a randomized per-widget delay.
  useEffect(() => {
    if (!EFFECTS.scrollReveal || prefersReducedMotion()) return undefined

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
      REVEAL_SELECTORS.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          if (seen.has(el) || el.classList.contains('fx-reveal')) return
          seen.add(el)
          el.classList.add('fx-reveal')
          if (EFFECTS.cardStagger) {
            el.style.setProperty('--reveal-delay', `${Math.round(Math.random() * STAGGER_MAX_MS)}ms`)
          }
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

  // J: a soft point-light that follows the cursor (page-wide + per-widget sheen).
  useEffect(() => {
    if (!EFFECTS.cursorLight || prefersReducedMotion()) return undefined

    const root = document.documentElement
    root.classList.add('fx-cursor-light')

    const tagLights = () => {
      LIGHT_SELECTORS.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => el.classList.add('fx-light'))
      })
    }
    tagLights()
    router.events.on('routeChangeComplete', tagLights)

    let frame = 0
    const onMove = (event) => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        root.style.setProperty('--cursor-x', `${event.clientX}px`)
        root.style.setProperty('--cursor-y', `${event.clientY}px`)
        const card = event.target?.closest?.('.fx-light')
        if (card) {
          const rect = card.getBoundingClientRect()
          card.style.setProperty('--lx', `${((event.clientX - rect.left) / rect.width) * 100}%`)
          card.style.setProperty('--ly', `${((event.clientY - rect.top) / rect.height) * 100}%`)
        }
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      router.events.off('routeChangeComplete', tagLights)
      if (frame) window.cancelAnimationFrame(frame)
      root.classList.remove('fx-cursor-light')
    }
  }, [router.events])

  return null
}
