import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function SeamlessCorridor({
  items,
  children,
  getItemLabel = (item) => item?.id || '',
  selectLabel,
}) {
  const rootRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const scenes = Array.isArray(items) ? items : []
  const activeItem = scenes[activeIndex]

  const select = (direction) => {
    if (scenes.length < 2) return
    const nextIndex = (activeIndex + direction + scenes.length) % scenes.length
    setActiveIndex(nextIndex)

    window.requestAnimationFrame(() => {
      const root = rootRef.current
      if (!root) return
      const top = root.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top, behavior: 'auto' })
    })
  }

  if (!activeItem) return null

  const previousItem = scenes[(activeIndex - 1 + scenes.length) % scenes.length]
  const nextItem = scenes[(activeIndex + 1) % scenes.length]
  const controls = scenes.length > 1 ? (
    <div className="seamless-corridor__controls" aria-label={selectLabel}>
      <button type="button" onClick={() => select(-1)} aria-label={getItemLabel(previousItem)}>
        <ChevronLeft aria-hidden="true" />
      </button>
      <button type="button" onClick={() => select(1)} aria-label={getItemLabel(nextItem)}>
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  ) : null

  return (
    <div ref={rootRef} className="seamless-corridor" data-active-index={activeIndex}>
      {children({
        item: activeItem,
        index: activeIndex,
        controls,
      })}
    </div>
  )
}
