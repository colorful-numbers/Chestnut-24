import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function Carousel({ ariaLabel, items, renderItem, className = '', itemClassName = '' }) {
  const viewportRef = useRef(null)
  const firstItemRef = useRef(null)
  const [index, setIndex] = useState(1)
  const [step, setStep] = useState(0)
  const [sideOffset, setSideOffset] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const dragStartRef = useRef(0)
  const activeDragRef = useRef(false)

  const loopItems = useMemo(() => {
    if (items.length <= 1) return items
    return [items[items.length - 1], ...items, items[0]]
  }, [items])

  const measure = useCallback(() => {
    const viewport = viewportRef.current
    const firstItem = firstItemRef.current
    if (!viewport || !firstItem) return

    const viewportWidth = viewport.getBoundingClientRect().width
    const itemWidth = firstItem.getBoundingClientRect().width
    const styles = window.getComputedStyle(viewport.querySelector('.carousel-track'))
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0
    setStep(itemWidth + gap)
    setSideOffset(Math.max(0, (viewportWidth - itemWidth) / 2))
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  useEffect(() => {
    setIndex(items.length > 1 ? 1 : 0)
  }, [items.length])

  const moveBy = useCallback((delta) => {
    if (items.length <= 1) return
    setTransitionEnabled(true)
    setIndex((current) => current + delta)
  }, [items.length])

  const handlePointerDown = (event) => {
    if (items.length <= 1) return
    activeDragRef.current = true
    dragStartRef.current = event.clientX
    setIsDragging(true)
    setTransitionEnabled(false)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!activeDragRef.current) return
    setDragOffset(event.clientX - dragStartRef.current)
  }

  const finishDrag = () => {
    if (!activeDragRef.current) return
    activeDragRef.current = false
    setIsDragging(false)
    setTransitionEnabled(true)

    const threshold = Math.max(48, step * 0.18)
    if (dragOffset <= -threshold) {
      moveBy(1)
    } else if (dragOffset >= threshold) {
      moveBy(-1)
    }
    setDragOffset(0)
  }

  const handleTransitionEnd = () => {
    if (items.length <= 1) return
    if (index === 0) {
      setTransitionEnabled(false)
      setIndex(items.length)
      requestAnimationFrame(() => requestAnimationFrame(() => setTransitionEnabled(true)))
    }
    if (index === items.length + 1) {
      setTransitionEnabled(false)
      setIndex(1)
      requestAnimationFrame(() => requestAnimationFrame(() => setTransitionEnabled(true)))
    }
  }

  const transform = `translate3d(${sideOffset - index * step + dragOffset}px, 0, 0)`

  return (
    <div
      ref={viewportRef}
      className={`carousel ${className} ${isDragging ? 'is-dragging' : ''}`}
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onPointerLeave={finishDrag}
    >
      <div
        className="carousel-track"
        style={{
          transform,
          transition: transitionEnabled ? 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {loopItems.map((item, loopIndex) => {
          const realIndex = items.length > 1
            ? (loopIndex === 0 ? items.length - 1 : loopIndex === loopItems.length - 1 ? 0 : loopIndex - 1)
            : loopIndex
          return (
            <div
              key={`${item.id || realIndex}-${loopIndex}`}
              ref={loopIndex === 0 ? firstItemRef : undefined}
              className={`carousel-item ${itemClassName}`}
              aria-hidden={items.length > 1 && (loopIndex === 0 || loopIndex === loopItems.length - 1)}
            >
              {renderItem(item, realIndex)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
