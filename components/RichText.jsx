import DefinitionText from './DefinitionText'
import { parseRichText } from '../lib/richText'

// Turn a list of styled runs (segments, or the partially-typed runs produced by
// the typing widget) into React nodes. `renderText` is applied to plain runs so
// inline 【definitions】 still linkify; link runs render their label verbatim to
// avoid nesting an anchor inside the definition anchor.
// `hideStrike` renders ~~struck~~ runs as plain text (used while typing, where the
// deletion is conveyed by the backspace animation instead of a line-through).
export function renderRichRuns(runs, { renderText, keyPrefix = 'r', hideStrike = false } = {}) {
  return runs.map((run, index) => {
    const key = `${keyPrefix}-${index}`

    const style = {}
    if (run.bold) style.fontWeight = 700
    if (run.italic) style.fontStyle = 'italic'
    const decoration = []
    if (run.underline) decoration.push('underline')
    if (run.strike && !hideStrike) decoration.push('line-through')
    if (decoration.length) style.textDecoration = decoration.join(' ')
    if (run.color) style.color = run.color
    const hasStyle = Object.keys(style).length > 0

    if (run.href) {
      const external = /^https?:/i.test(run.href)
      return (
        <a
          key={key}
          href={run.href}
          className="dialog-link"
          style={hasStyle ? style : undefined}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {run.text}
        </a>
      )
    }

    const content = renderText ? renderText(run.text) : run.text
    if (!hasStyle) return <span key={key}>{content}</span>
    return (
      <span key={key} className="rich-run" style={style}>
        {content}
      </span>
    )
  })
}

// Static (non-animated) inline rich-text. Strikethrough renders struck-through
// here; the typing widget is the only place that plays the deletion animation.
export default function RichText({ children, definitions = [] }) {
  if (typeof children !== 'string') return children
  const { quote, segments } = parseRichText(children)
  const renderText = (value) => <DefinitionText definitions={definitions}>{value}</DefinitionText>
  const body = renderRichRuns(segments, { renderText })
  return quote ? <span className="dialog-quote">{body}</span> : <>{body}</>
}
