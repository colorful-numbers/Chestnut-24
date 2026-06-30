import { useEffect, useMemo, useRef, useState } from 'react'
import { parseRichText } from '../lib/richText'
import { renderRichRuns } from './RichText'

// Deletion animation tuning for ~~strikethrough~~ runs: a brief hold so the
// struck text is readable, then a quick backspace per character.
const STRIKE_HOLD = 360
const DELETE_SPEED = 24

function extractText(children) {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(extractText).join('')
  if (children?.props?.children) return extractText(children.props.children)
  return ''
}

// Pre-format the line into an event timeline. Inline markup is resolved up front
// so the raw syntax (`*`, `~~`, tags…) is never revealed mid-type. Each event
// either inserts one styled glyph or deletes the last one; strikethrough runs
// are typed in full and then deleted so the final text omits them.
function buildPlan(text, { speed, pauseOnSpace }) {
  const { quote, segments } = parseRichText(text)

  const glyphs = []
  segments.forEach((segment) => {
    const { text: runText, ...style } = segment
    Array.from(runText).forEach((ch) => glyphs.push({ ch, style }))
  })

  const events = []
  let i = 0
  while (i < glyphs.length) {
    if (glyphs[i].style.strike) {
      let j = i
      while (j < glyphs.length && glyphs[j].style.strike) j += 1
      for (let k = i; k < j; k += 1) {
        const { ch } = glyphs[k]
        events.push({ type: 'insert', glyph: glyphs[k], delay: ch === ' ' ? pauseOnSpace : speed })
      }
      for (let k = i; k < j; k += 1) {
        events.push({ type: 'delete', delay: k === i ? STRIKE_HOLD : DELETE_SPEED })
      }
      i = j
    } else {
      const { ch } = glyphs[i]
      events.push({ type: 'insert', glyph: glyphs[i], delay: ch === ' ' ? pauseOnSpace : speed })
      i += 1
    }
  }

  return { quote, events }
}

// Replay the timeline up to `count`, then group adjacent glyphs that share a
// style descriptor back into runs for rendering.
function visibleRuns(events, count) {
  const out = []
  for (let k = 0; k < count; k += 1) {
    const event = events[k]
    if (event.type === 'insert') out.push(event.glyph)
    else out.pop()
  }

  const runs = []
  let current = null
  out.forEach((glyph) => {
    if (current && current.style === glyph.style) {
      current.text += glyph.ch
    } else {
      current = { ...glyph.style, text: glyph.ch, style: glyph.style }
      runs.push(current)
    }
  })
  return runs
}

export default function Typing({ children, speed = 28, pauseOnSpace = 80, cursor = true, instant = false, onDone, renderText }) {
  const source = typeof children === 'string' ? children : extractText(children)
  const { quote, events } = useMemo(
    () => buildPlan(source, { speed, pauseOnSpace }),
    [source, speed, pauseOnSpace],
  )
  const [count, setCount] = useState(0)
  const timerRef = useRef(null)
  const done = count >= events.length

  useEffect(() => {
    setCount(0)
  }, [events])

  useEffect(() => {
    if (instant) {
      setCount(events.length)
      return undefined
    }
    if (done) return undefined

    const delay = events[count]?.delay ?? speed
    timerRef.current = window.setTimeout(() => {
      setCount((value) => value + 1)
    }, delay)

    return () => window.clearTimeout(timerRef.current)
  }, [count, done, instant, events, speed])

  useEffect(() => {
    if (done) onDone?.()
  }, [done, onDone])

  const runs = useMemo(() => visibleRuns(events, Math.min(count, events.length)), [events, count])
  // Struck text is shown as normal while typing — the deletion animation, not a
  // line-through, signals the removal. (The backlog keeps the line-through.)
  const body = renderRichRuns(runs, { renderText, hideStrike: true })

  return (
    <span className="typing">
      {quote ? <span className="dialog-quote">{body}</span> : body}
      {cursor && <span className={done ? 'typing__cursor typing__cursor--done' : 'typing__cursor'}>|</span>}
    </span>
  )
}
