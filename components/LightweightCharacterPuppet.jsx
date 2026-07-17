import { useEffect, useRef } from 'react'

const MOOD_BY_NAME = [
  ['happy', 'open'],
  ['sincerely', 'open'],
  ['focused', 'focused'],
  ['tired', 'tired'],
  ['uncertain', 'uncertain'],
  ['indifference', 'reserved'],
]

export function moodFromExpression(expression = '') {
  const normalized = expression.toLowerCase()
  return MOOD_BY_NAME.find(([name]) => normalized.includes(name))?.[1] || 'neutral'
}

export default function LightweightCharacterPuppet({ src, alt = '', mood = 'neutral' }) {
  const puppetRef = useRef(null)

  useEffect(() => {
    const puppet = puppetRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia('(pointer: coarse)')

    if (!puppet || reduceMotion.matches || coarsePointer.matches) return undefined

    let frame = 0
    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2

    const update = () => {
      frame = 0
      const x = (pointerX / Math.max(window.innerWidth, 1) - 0.5) * 2
      const y = (pointerY / Math.max(window.innerHeight, 1) - 0.5) * 2

      puppet.style.setProperty('--puppet-look-x', `${x * 7}px`)
      puppet.style.setProperty('--puppet-look-y', `${y * 3}px`)
      puppet.style.setProperty('--puppet-look-angle', `${x * 0.7}deg`)
    }

    const onPointerMove = (event) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      ref={puppetRef}
      className={`character-puppet character-puppet--${mood}`}
      data-puppet-runtime="css-compositor"
    >
      <div className="character-puppet__plane">
        <img
          className="character-display__main character-stage__sprite character-puppet__image"
          src={src}
          alt={alt}
          draggable="false"
        />
      </div>
      <span className="character-puppet__ground" aria-hidden="true" />
    </div>
  )
}
