import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

export default function Carousel({ ariaLabel, items, renderItem, className = '', itemClassName = '' }) {
  const viewportRef = useRef(null)
  const firstItemRef = useRef(null)
  const [index, setIndex] = useState(1)
  const [step, setStep] = useState(0)
  const [sideOffset, setSideOffset] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [transitionEnabled, setTransitionEnabled] = useState(false)
  const [ready, setReady] = useState(false)
  const dragStartRef = useRef(0)
  const activeDragRef = useRef(false)
  const didDragRef = useRef(false)

  const hasLoop = items.length > 1

  // Wrap the list so the last card is cloned to the left of the first card and
  // the first card is cloned to the right of the last card. This gives every
  // edge a neighbour to scroll onto, enabling seamless cyclic scrolling.
  const loopItems = useMemo(() => {
    if (!hasLoop) return items
    return [items[items.length - 1], ...items, items[0]]
  }, [items, hasLoop])

  const measure = useCallback(() => {
    const viewport = viewportRef.current
    const firstItem = firstItemRef.current
    if (!viewport || !firstItem) return

    const viewportWidth = viewport.getBoundingClientRect().width
    const itemWidth = firstItem.getBoundingClientRect().width
    const track = viewport.querySelector('.carousel-track')
    const styles = window.getComputedStyle(track)
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0
    setStep(itemWidth + gap)
    setSideOffset(Math.max(0, (viewportWidth - itemWidth) / 2))
  }, [])

  // Measure before the first paint so the starting transform is already correct
  // and the carousel never visibly jumps from translateX(0) into position.
  useLayoutEffect(() => {
    measure()
  }, [measure, loopItems])

  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  // Once a real measurement exists and the correct frame has painted, turn on
  // the slide transition. Doing this lazily avoids animating the initial layout.
  useEffect(() => {
    if (step > 0 && !ready) {
      const raf = requestAnimationFrame(() => {
        setReady(true)
        setTransitionEnabled(true)
      })
      return () => cancelAnimationFrame(raf)
    }
    return undefined
  }, [step, ready])

  useEffect(() => {
    setIndex(hasLoop ? 1 : 0)
  }, [items.length, hasLoop])

  const moveBy = useCallback((delta) => {
    if (!hasLoop) return
    setTransitionEnabled(true)
    setIndex((current) => current + delta)
  }, [hasLoop])

  const handlePointerDown = (event) => {
    if (!hasLoop) return
    activeDragRef.current = true
    didDragRef.current = false
    dragStartRef.current = event.clientX
    // Note: pointer capture is deliberately *not* taken here. Capturing on press
    // suppresses the synthetic click on the card link, so a plain tap would never
    // navigate. We only capture once an actual drag is detected (below).
  }

  const handlePointerMove = (event) => {
    if (!activeDragRef.current) return
    const offset = event.clientX - dragStartRef.current
    if (!didDragRef.current && Math.abs(offset) > 6) {
      didDragRef.current = true
      setIsDragging(true)
      setTransitionEnabled(false)
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }
    if (didDragRef.current) setDragOffset(offset)
  }

  const finishDrag = () => {
    if (!activeDragRef.current) return
    const dragged = didDragRef.current
    activeDragRef.current = false
    setIsDragging(false)
    setTransitionEnabled(true)

    if (dragged) {
      const threshold = Math.max(48, step * 0.18)
      if (dragOffset <= -threshold) {
        moveBy(1)
      } else if (dragOffset >= threshold) {
        moveBy(-1)
      }
    }
    setDragOffset(0)
  }

  // Swallow the click that follows a drag so cards-as-links don't navigate when
  // the user was only swiping the carousel.
  const handleClickCapture = (event) => {
    if (didDragRef.current) {
      event.preventDefault()
      event.stopPropagation()
      didDragRef.current = false
    }
  }

  const handleTransitionEnd = () => {
    if (!hasLoop) return
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

  const activeIndex = useMemo(() => {
    if (!hasLoop) return 0
    if (index === 0) return items.length - 1
    if (index === items.length + 1) return 0
    return index - 1
  }, [index, items.length, hasLoop])

  const goTo = (nextIndex) => {
    if (!hasLoop) return
    setTransitionEnabled(true)
    setIndex(nextIndex + 1)
  }

  const transform = `translate3d(${sideOffset - index * step + dragOffset}px, 0, 0)`

  return (
    <div className={`carousel-shell ${className}`}>
      <div
        ref={viewportRef}
        className={`carousel ${isDragging ? 'is-dragging' : ''}`}
        aria-label={ariaLabel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onPointerLeave={finishDrag}
        onClickCapture={handleClickCapture}
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
            const isClone = hasLoop && (loopIndex === 0 || loopIndex === loopItems.length - 1)
            const realIndex = hasLoop
              ? (loopIndex === 0 ? items.length - 1 : loopIndex === loopItems.length - 1 ? 0 : loopIndex - 1)
              : loopIndex
            return (
              <div
                key={`${item.id || realIndex}-${loopIndex}`}
                ref={loopIndex === 0 ? firstItemRef : undefined}
                className={`carousel-item ${itemClassName}`}
                aria-hidden={isClone}
              >
                {renderItem(item, realIndex, isClone)}
              </div>
            )
          })}
        </div>
      </div>
      {hasLoop && (
        <div className="carousel-dots" aria-label={`${ariaLabel} selector`}>
          {items.map((item, dotIndex) => (
            <button
              key={item.id || dotIndex}
              type="button"
              className={dotIndex === activeIndex ? 'is-active' : ''}
              aria-label={`${ariaLabel} ${dotIndex + 1}`}
              aria-current={dotIndex === activeIndex}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
