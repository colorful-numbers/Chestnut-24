import { useEffect, useRef } from 'react'

export default function QiLayeredPuppet({ src, alt = '', mood = 'neutral' }) {
  const rigRef = useRef(null)

  useEffect(() => {
    const rig = rigRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia('(pointer: coarse)')

    if (!rig || reduceMotion.matches || coarsePointer.matches) return undefined

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
  }, [])

  return (
    <div
      ref={rigRef}
      className={`qi-rig qi-rig--${mood}`}
      data-puppet-runtime="layered-bone-css"
    >
      <div className="qi-rig__bone qi-rig__bone--lower">
        <img className="character-display__main character-stage__sprite" src={src} alt="" draggable="false" />
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
