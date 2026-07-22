import { useEffect, useRef, useState } from 'react'

const MOOD_BY_NAME = [
  ['happy', 'happy'],
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

function supportsExperiment() {
  if (typeof window === 'undefined') return false
  if (!window.PointerEvent || !window.requestAnimationFrame) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (window.matchMedia('(pointer: coarse)').matches) return false
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return false
  return window.CSS?.supports?.('transform', 'translate3d(0, 0, 0)') ?? false
}

export default function LightweightCharacterPuppet({
  src,
  alt = '',
  mood = 'neutral',
  expression = '',
  speaking = false,
}) {
  const puppetRef = useRef(null)
  const [supported, setSupported] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setSupported(supportsExperiment())
  }, [])

  useEffect(() => {
    if (!supported || failed) return undefined
    const puppet = puppetRef.current
    if (!puppet) return undefined

    let frame = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const update = () => {
      currentX += (targetX - currentX) * 0.16
      currentY += (targetY - currentY) * 0.16

      puppet.style.setProperty('--puppet-look-x', `${currentX * 9}px`)
      puppet.style.setProperty('--puppet-look-y', `${currentY * 4}px`)
      puppet.style.setProperty('--puppet-look-angle', `${currentX * 0.85}deg`)
      puppet.style.setProperty('--puppet-eye-x', `${currentX * 1.8}px`)
      puppet.style.setProperty('--puppet-eye-y', `${currentY * 0.8}px`)

      if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
        frame = window.requestAnimationFrame(update)
      } else {
        frame = 0
      }
    }

    const onPointerMove = (event) => {
      const bounds = puppet.getBoundingClientRect()
      targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 2))
      targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 2))
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    const onPointerLeave = () => {
      targetX = 0
      targetY = 0
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [failed, supported])

  const active = supported && ready && !failed
  const closedEyes = expression.toLowerCase().includes('happy')

  return (
    <div
      ref={puppetRef}
      className={`character-puppet character-puppet--${mood} ${active ? 'is-active' : 'is-fallback'} ${speaking ? 'is-speaking' : ''}`}
      data-puppet-runtime="artifact101-stage1-css"
      data-puppet-state={active ? 'active' : 'fallback'}
    >
      <img
        className="character-display__main character-stage__sprite character-puppet__fallback"
        src={src}
        alt={alt}
        draggable="false"
      />
      {supported && !failed && (
        <div className="character-puppet__rig" aria-hidden="true">
          <div className="character-puppet__breath">
            <img
              className="character-puppet__art"
              src={src}
              alt=""
              draggable="false"
              onLoad={() => setReady(true)}
              onError={() => setFailed(true)}
            />
            {!closedEyes && (
              <>
                <span className="character-puppet__lid character-puppet__lid--left" />
                <span className="character-puppet__lid character-puppet__lid--right" />
                <span className="character-puppet__gaze character-puppet__gaze--left" />
                <span className="character-puppet__gaze character-puppet__gaze--right" />
              </>
            )}
            <span className="character-puppet__mouth" />
          </div>
        </div>
      )}
    </div>
  )
}
