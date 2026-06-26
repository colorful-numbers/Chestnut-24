import { useEffect, useMemo, useRef, useState } from 'react'

function extractText(children) {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (children?.props?.children) return extractText(children.props.children)
  return ''
}

export default function Typing({ children, speed = 28, pauseOnSpace = 80, cursor = true, instant = false, onDone }) {
  const text = useMemo(() => extractText(children), [children])
  const [count, setCount] = useState(0)
  const timerRef = useRef(null)
  const done = count >= text.length

  useEffect(() => {
    setCount(0)
  }, [text])

  useEffect(() => {
    if (instant) {
      setCount(text.length)
      return undefined
    }
    if (done) return undefined

    const char = text[count]
    const baseDelay = char === ' ' ? pauseOnSpace : speed
    timerRef.current = window.setTimeout(() => {
      setCount((current) => current + 1)
    }, baseDelay)

    return () => window.clearTimeout(timerRef.current)
  }, [count, done, instant, pauseOnSpace, speed, text])

  useEffect(() => {
    if (done) onDone?.()
  }, [done, onDone])

  return (
    <span className="typing">
      {text.slice(0, count)}
      {cursor && <span className={done ? 'typing__cursor typing__cursor--done' : 'typing__cursor'}>|</span>}
    </span>
  )
}
