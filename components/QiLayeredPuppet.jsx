import { useEffect, useRef, useState } from 'react'
import { supportsPuppet } from '../lib/puppetSupport'

// Qi draws the approved transparent portrait as three clipped, aligned planes
// bound to a lower-body/torso/head hierarchy. `onUnavailable` lets the dialogue
// stage fall back to the plain still-image renderer when the rig cannot run.
export default function QiLayeredPuppet({ src, alt = '', mood = 'neutral', onUnavailable }) {
  const rigRef = useRef(null)
  const [supported, setSupported] = useState(null)
  const [failed, setFailed] = useState(false)

  const reportRef = useRef(onUnavailable)
  reportRef.current = onUnavailable

  useEffect(() => {
    setSupported(supportsPuppet())
  }, [])

  // Report once the gate says no or the art fails, so the stage can swap back
  // to the still renderer instead of leaving three motionless planes up.
  useEffect(() => {
    if (supported === false || failed) reportRef.current?.()
  }, [failed, supported])

  useEffect(() => {
    if (!supported || failed) return undefined
    const rig = rigRef.current
    if (!rig) return undefined

    let frame = 0
    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2

    const update = () => {
      frame = 0
      const x = (pointerX / Math.max(window.innerWidth, 1) - 0.5) * 2
      const y = (pointerY / Math.max(window.innerHeight, 1) - 0.5) * 2

      rig.style.setProperty('--qi-head-x', `${x * 3}px`)
      rig.style.setProperty('--qi-head-y', `${y * 1.5}px`)
      rig.style.setProperty('--qi-head-angle', `${x * 0.45}deg`)
      rig.style.setProperty('--qi-torso-x', `${x}px`)
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
  }, [failed, supported])

  // Until the gate has run (and whenever it or the art says no) render the same
  // single still image the fallback renderer would, so nothing flashes.
  if (!supported || failed) {
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

  return (
    <div
      ref={rigRef}
      className={`qi-rig qi-rig--${mood}`}
      data-puppet-runtime="layered-bone-css"
    >
      <div className="qi-rig__bone qi-rig__bone--lower">
        <img
          className="character-display__main character-stage__sprite"
          src={src}
          alt=""
          draggable="false"
          onError={() => setFailed(true)}
        />
      </div>
      <div className="qi-rig__bone qi-rig__bone--torso">
        <img className="character-display__main character-stage__sprite" src={src} alt="" draggable="false" />
      </div>
      <div className="qi-rig__bone qi-rig__bone--head">
        <img className="character-display__main character-stage__sprite" src={src} alt={alt} draggable="false" />
      </div>
      <span className="character-puppet__ground" aria-hidden="true" />
    </div>
  )
}
