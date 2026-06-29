// Shared, dependency-free markdown helpers used by the file-based content
// loaders (definitions, side stories). Frontmatter holds non-rendered metadata
// (aliases, time, media, kicker, ...) and the body holds the localized prose.

export function parseFrontmatter(source) {
  if (!source.startsWith('---')) return { frontmatter: {}, body: source.trim() }
  const end = source.indexOf('\n---', 3)
  if (end === -1) return { frontmatter: {}, body: source.trim() }
  const raw = source.slice(3, end).trim()
  const body = source.slice(end + 4).trim()
  const frontmatter = {}

  raw.split(/\r?\n/).forEach((line) => {
    const [rawKey, ...rest] = line.split(':')
    if (!rawKey || rest.length === 0) return
    // Keys may be bare (`time:`) or quoted (`"title":`).
    const key = rawKey.trim().replace(/^["']|["']$/g, '')
    if (!key) return
    const value = rest.join(':').trim()
    if (value.startsWith('[')) {
      frontmatter[key] = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((item) => item.trim().replace(/^"|"$/g, ''))
        .filter(Boolean)
    } else {
      frontmatter[key] = value.replace(/^["']|["']$/g, '')
    }
  })

  return { frontmatter, body }
}

export function stripMarkdown(value) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>#-]/g, '')
    .trim()
}

// Split a markdown body into its `# ` title and the remaining paragraphs.
export function splitTitleAndParagraphs(body, fallbackTitle = '') {
  const lines = body.split(/\r?\n/)
  const titleLine = lines.find((line) => line.startsWith('# '))
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : fallbackTitle
  const content = lines.filter((line) => !line.startsWith('# ')).join('\n').trim()
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  return { title, paragraphs, content }
}
