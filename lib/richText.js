// Inline rich-text parser shared by the dialogue typing widget and the static
// renderer (components/RichText.jsx). It turns one line of dialogue into a flat
// list of styled segments so the markup never leaks into the typed output.
//
// Supported INLINE formatting (block-level markdown is intentionally excluded —
// code blocks, lists, images, and `details` are reserved or unsupported):
//   **bold**            <b>/<strong>
//   *italic* / _italic_ <i>/<em>
//   ~~strike~~          <s>/<del>      (typed, then deleted on the stage)
//   <u>underline</u>
//   [label](url)        <a href="url">
//   <span style="color: …"> / <font color="…">  inline colour
//   a leading `> `      marks the whole line as a quotation
//
// Output: { quote, segments } where each segment is
//   { text, bold, italic, strike, underline, color, href }

const LINK_RE = /^\[([^\]]+)\]\(([^)]+)\)/
const HTML_TAG_RE = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)\s*(\/?)>/

function safeHref(url) {
  const value = String(url || '').trim()
  return /^(https?:|\/|#|mailto:)/i.test(value) ? value : '#'
}

// Allow only a conservative set of CSS colour tokens (hex, rgb()/hsl(), named).
function safeColor(value) {
  const v = String(value || '').trim()
  if (!v || v.length > 40) return null
  return /^[#a-zA-Z0-9(),.%\s-]+$/.test(v) ? v : null
}

function colorFromAttrs(attrs) {
  const style = /style\s*=\s*"([^"]*)"/i.exec(attrs)
  if (style) {
    const match = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(style[1])
    if (match) return safeColor(match[1])
  }
  const attr = /\bcolor\s*=\s*"([^"]*)"/i.exec(attrs)
  return attr ? safeColor(attr[1]) : null
}

const isSpace = (ch) => !ch || /\s/.test(ch)

export function parseRichText(input) {
  let text = String(input ?? '')
  let quote = false
  const quoteMark = /^\s*>\s?/.exec(text)
  if (quoteMark) {
    quote = true
    text = text.slice(quoteMark[0].length)
  }

  const segments = []
  let buf = ''

  // Markdown emphasis is toggled; HTML tags nest, so they are counted.
  let starItalic = false
  let underItalic = false
  let mdBold = false
  let mdStrike = false
  let hBold = 0
  let hItalic = 0
  let hStrike = 0
  let hUnder = 0
  const colorStack = []
  const hrefStack = []

  const current = () => ({
    bold: mdBold || hBold > 0,
    italic: starItalic || underItalic || hItalic > 0,
    strike: mdStrike || hStrike > 0,
    underline: hUnder > 0,
    color: colorStack.length ? colorStack[colorStack.length - 1] : null,
    href: hrefStack.length ? hrefStack[hrefStack.length - 1] : null,
  })

  const flush = () => {
    if (!buf) return
    segments.push({ text: buf, ...current() })
    buf = ''
  }

  // A self-contained run (e.g. a markdown link) whose text is not re-parsed.
  const pushRun = (runText, overrides) => {
    if (!runText) return
    flush()
    segments.push({ text: runText, ...current(), ...overrides })
  }

  let i = 0
  while (i < text.length) {
    const rest = text.slice(i)
    const ch = text[i]

    const link = LINK_RE.exec(rest)
    if (link) {
      pushRun(link[1], { href: safeHref(link[2].trim()) })
      i += link[0].length
      continue
    }

    const tag = HTML_TAG_RE.exec(rest)
    if (tag) {
      const closing = tag[1] === '/'
      const name = tag[2].toLowerCase()
      const attrs = tag[3] || ''
      flush()
      switch (name) {
        case 'b':
        case 'strong':
          hBold = closing ? Math.max(0, hBold - 1) : hBold + 1
          break
        case 'i':
        case 'em':
          hItalic = closing ? Math.max(0, hItalic - 1) : hItalic + 1
          break
        case 's':
        case 'del':
        case 'strike':
          hStrike = closing ? Math.max(0, hStrike - 1) : hStrike + 1
          break
        case 'u':
          hUnder = closing ? Math.max(0, hUnder - 1) : hUnder + 1
          break
        case 'span':
        case 'font':
          if (closing) colorStack.pop()
          else colorStack.push(colorFromAttrs(attrs))
          break
        case 'a':
          if (closing) hrefStack.pop()
          else {
            const href = /\bhref\s*=\s*"([^"]*)"/i.exec(attrs)
            hrefStack.push(href ? safeHref(href[1]) : '#')
          }
          break
        case 'br':
          buf += '\n'
          break
        default:
          // Unknown tag: drop it rather than render the literal angle brackets.
          break
      }
      i += tag[0].length
      continue
    }

    if (rest.startsWith('**')) {
      flush()
      mdBold = !mdBold
      i += 2
      continue
    }
    if (rest.startsWith('~~')) {
      flush()
      mdStrike = !mdStrike
      i += 2
      continue
    }

    // Single-char emphasis with flanking checks so stray `*`/`_` (e.g. "2 * 3"
    // or file_names) are not treated as markup.
    if (ch === '*' || ch === '_') {
      const prev = text[i - 1]
      const next = text[i + 1]
      const open = ch === '*' ? starItalic : underItalic
      if (open && !isSpace(prev)) {
        flush()
        if (ch === '*') starItalic = false
        else underItalic = false
        i += 1
        continue
      }
      if (!open && !isSpace(next) && next !== ch) {
        flush()
        if (ch === '*') starItalic = true
        else underItalic = true
        i += 1
        continue
      }
    }

    buf += ch
    i += 1
  }
  flush()

  return { quote, segments }
}
