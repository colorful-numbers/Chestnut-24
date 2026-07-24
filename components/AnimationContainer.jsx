import { useEffect, useRef } from 'react'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export default function AnimationContainer({
  children,
  className = '',
  height = 360,
  labelledBy,
  onProgress,
}) {
  const rootRef = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    let textFrame = 0
    let textProgress = 0
    let textTarget = 0
    let lastTextTime = 0

    const animateText = (time) => {
      textFrame = 0
      const elapsed = lastTextTime ? Math.min(time - lastTextTime, 64) : 16
      const duration = textTarget > textProgress ? 1600 : 650
      const distance = textTarget - textProgress
      const step = elapsed / duration

      lastTextTime = time
      textProgress = Math.abs(distance) <= step
        ? textTarget
        : textProgress + Math.sign(distance) * step
      root.style.setProperty('--text-time-progress', textProgress.toFixed(4))

      if (textProgress !== textTarget) {
        textFrame = window.requestAnimationFrame(animateText)
      } else {
        lastTextTime = 0
      }
    }

    const setTextTarget = (nextTarget) => {
      if (textTarget === nextTarget && (textFrame || textProgress === nextTarget)) return
      textTarget = nextTarget
      if (!textFrame) {
        lastTextTime = 0
        textFrame = window.requestAnimationFrame(animateText)
      }
    }

    const render = () => {
      frameRef.current = 0
      const bounds = root.getBoundingClientRect()
      const scrollRange = Math.max(root.offsetHeight - window.innerHeight, 1)
      const progress = clamp(-bounds.top / scrollRange, 0, 1)
      const isTextActive = bounds.top < window.innerHeight * 0.78
        && bounds.bottom > window.innerHeight * 0.22
      root.style.setProperty('--animation-progress', progress.toFixed(4))
      setTextTarget(isTextActive ? 1 : 0)
      onProgress?.(progress)
    }

    const requestRender = () => {
      if (frameRef.current) return
      frameRef.current = window.requestAnimationFrame(render)
    }

    render()
    window.addEventListener('scroll', requestRender, { passive: true })
    window.addEventListener('resize', requestRender)

    return () => {
      window.removeEventListener('scroll', requestRender)
      window.removeEventListener('resize', requestRender)
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
      if (textFrame) window.cancelAnimationFrame(textFrame)
    }
  }, [onProgress])

  const handlePointerMove = (event) => {
    const root = rootRef.current
    if (!root || event.pointerType === 'touch') return
    const bounds = root.getBoundingClientRect()
    const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1)
    const y = clamp((event.clientY - bounds.top) / window.innerHeight, 0, 1)
    root.style.setProperty('--pointer-x', (x - 0.5).toFixed(3))
    root.style.setProperty('--pointer-y', (y - 0.5).toFixed(3))
  }

  const resetPointer = () => {
    const root = rootRef.current
    if (!root) return
    root.style.setProperty('--pointer-x', '0')
    root.style.setProperty('--pointer-y', '0')
  }

  return (
    <div
      ref={rootRef}
      className={`animation-container ${className}`.trim()}
      style={{ '--animation-height': `${height}svh` }}
      aria-labelledby={labelledBy}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <div className="animation-container__sticky">
        {children}
      </div>
    </div>
  )
}
