import { useEffect, useRef, useState } from 'react'
import { supportsPuppet } from '../lib/puppetSupport'
import { PUPPET_RIGS, maskLayers, pivots } from '../lib/puppetRigs'

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

// Draws one expression image as three masked planes bound to a
// lower-body / torso / head hierarchy, so a flat illustration gains a small
// amount of articulated motion without a canvas or a model runtime.
//
// The planes are cut with complementary alpha ramps (lib/puppetRigs.js) rather
// than hard clips: at rest they add back up to the original image exactly, and
// once a joint moves the overlap bends instead of tearing.
//
// `onUnavailable` tells the dialogue stage to drop back to the plain
// still-image renderer whenever this rig cannot run.
export default function LayeredCharacterPuppet({
  src,
  alt = '',
  mood = 'neutral',
  characterId,
  speaking = false,
  onUnavailable,
}) {
  const rigRef = useRef(null)
  const [supported, setSupported] = useState(null)
  const [failed, setFailed] = useState(false)

  const rig = PUPPET_RIGS[characterId]

  // Kept in a ref so an inline arrow prop cannot re-trigger the report effect.
  const reportRef = useRef(onUnavailable)
  reportRef.current = onUnavailable

  useEffect(() => {
    setSupported(supportsPuppet())
  }, [])

  useEffect(() => {
    if (supported === false || failed || !rig) reportRef.current?.()
  }, [failed, rig, supported])

  // Motion amplitudes are fractions of the rendered character height, so the rig
  // reads the same on a phone-sized stage and a wide desktop one. The height is
  // published as a CSS variable and every transform is a calc() against it.
  useEffect(() => {
    if (!supported || failed || !rig) return undefined
    const node = rigRef.current
    if (!node) return undefined

    const art = node.querySelector('.character-puppet__art')
    if (!art) return undefined

    const publishHeight = () => {
      const { height } = art.getBoundingClientRect()
      if (height > 0) node.style.setProperty('--puppet-h', `${height}px`)
    }
    publishHeight()

    const observer = new ResizeObserver(publishHeight)
    observer.observe(art)
    return () => observer.disconnect()
  }, [failed, rig, supported])

  // Pointer look: the head leads, the torso follows a fraction of the way, and
  // both ease toward the target so a fast cursor cannot snap the neck.
  useEffect(() => {
    if (!supported || failed || !rig) return undefined
    const node = rigRef.current
    if (!node) return undefined

    let frame = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const step = () => {
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12

      node.style.setProperty('--puppet-look-x', currentX.toFixed(4))
      node.style.setProperty('--puppet-look-y', currentY.toFixed(4))

      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        frame = window.requestAnimationFrame(step)
      } else {
        frame = 0
      }
    }

    const onPointerMove = (event) => {
      // Measured against the character's own box, not the viewport, so the gaze
      // is centred on the art wherever the stage sits on the page.
      const bounds = node.querySelector('.character-puppet__art')?.getBoundingClientRect()
      if (!bounds) return
      const x = (event.clientX - (bounds.left + bounds.width / 2)) / Math.max(bounds.width, 1)
      const y = (event.clientY - (bounds.top + bounds.height * 0.3)) / Math.max(bounds.height, 1)
      targetX = Math.max(-1, Math.min(1, x * 1.6))
      targetY = Math.max(-1, Math.min(1, y * 1.6))
      if (!frame) frame = window.requestAnimationFrame(step)
    }

    const recentre = () => {
      targetX = 0
      targetY = 0
      if (!frame) frame = window.requestAnimationFrame(step)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('blur', recentre)
    document.addEventListener('pointerleave', recentre)

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('blur', recentre)
      document.removeEventListener('pointerleave', recentre)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [failed, rig, supported])

  // Until the gate has run — and whenever it, the rig table, or the art says no —
  // render exactly what the still renderer would, so nothing flashes or tears.
  if (!supported || failed || !rig) {
    return (
      <img
        className="character-display__main character-stage__sprite"
        src={src}
        alt={alt}
        draggable="false"
        onError={() => setFailed(true)}
      />
    )
  }

  const masks = maskLayers(rig)
  const pivot = pivots(rig)
  const bone = (name, extraProps = {}) => (
    <div className={`character-puppet__bone character-puppet__bone--${name}`}>
      <div className="character-puppet__motion">
        <img
          className="character-display__main character-stage__sprite character-puppet__art"
          style={{ maskImage: masks[name], WebkitMaskImage: masks[name] }}
          src={src}
          alt=""
          draggable="false"
          {...extraProps}
        />
      </div>
    </div>
  )

  return (
    <div
      ref={rigRef}
      className={`character-puppet character-puppet--${mood} ${speaking ? 'is-speaking' : ''}`}
      data-puppet-runtime="layered-bone-css"
      style={{
        '--puppet-neck': `${pivot.neck}%`,
        '--puppet-waist': `${pivot.waist}%`,
        '--puppet-breathe': rig.breathe,
      }}
    >
      <span className="character-puppet__ground" aria-hidden="true" />
      {bone('lower', { onError: () => setFailed(true) })}
      {bone('torso')}
      {bone('head', { alt })}
    </div>
  )
}
