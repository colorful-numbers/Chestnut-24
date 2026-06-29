// Minimal, dependency-free markdown -> HTML for the on-site dev notes. Supports
// the subset the notes actually use: headings, unordered lists, paragraphs,
// fenced code blocks, inline code, bold, and links. Input is trusted local docs.

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inline(value) {
  let out = escapeHtml(value)
  out = out.replace(/`([^`]+)`/g, (_match, code) => `<code>${code}</code>`)
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
    const safe = /^(https?:|\/|#)/.test(url) ? url : '#'
    return `<a href="${safe}">${text}</a>`
  })
  return out
}

export function renderMarkdown(markdown) {
  const lines = String(markdown || '').split(/\r?\n/)
  const html = []
  let inList = false
  let inCode = false
  let code = []

  const closeList = () => {
    if (inList) {
      html.push('</ul>')
      inList = false
    }
  }

  lines.forEach((raw) => {
    const trimmed = raw.trim()

    if (trimmed.startsWith('```')) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
        code = []
        inCode = false
      } else {
        closeList()
        inCode = true
      }
      return
    }
    if (inCode) {
      code.push(raw)
      return
    }
    if (!trimmed) {
      closeList()
      return
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      closeList()
      const level = heading[1].length
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      return
    }

    const item = trimmed.match(/^[-*]\s+(.*)$/)
    if (item) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${inline(item[1])}</li>`)
      return
    }

    closeList()
    html.push(`<p>${inline(trimmed)}</p>`)
  })

  if (inCode) html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`)
  closeList()
  return html.join('\n')
}
