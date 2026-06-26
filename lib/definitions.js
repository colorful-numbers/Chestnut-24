import fs from 'fs'
import path from 'path'

const DEFINITIONS_DIR = path.join(process.cwd(), 'data', 'definitions')

function parseFrontmatter(source) {
  if (!source.startsWith('---')) return { frontmatter: {}, body: source }
  const end = source.indexOf('\n---', 3)
  if (end === -1) return { frontmatter: {}, body: source }
  const raw = source.slice(3, end).trim()
  const body = source.slice(end + 4).trim()
  const frontmatter = {}

  raw.split(/\r?\n/).forEach((line) => {
    const [key, ...rest] = line.split(':')
    if (!key || rest.length === 0) return
    const value = rest.join(':').trim()
    if (value.startsWith('[')) {
      frontmatter[key.trim()] = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((item) => item.trim().replace(/^"|"$/g, ''))
        .filter(Boolean)
    } else {
      frontmatter[key.trim()] = value.replace(/^"|"$/g, '')
    }
  })

  return { frontmatter, body }
}

function stripMarkdown(value) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_>#-]/g, '')
    .trim()
}

export function getDefinitions() {
  if (!fs.existsSync(DEFINITIONS_DIR)) return []

  return fs.readdirSync(DEFINITIONS_DIR)
    .filter((file) => file.endsWith('.md') && file !== 'README.md')
    .map((file) => {
      const slug = file.replace(/\.md$/, '')
      const source = fs.readFileSync(path.join(DEFINITIONS_DIR, file), 'utf8')
      const { frontmatter, body } = parseFrontmatter(source)
      const lines = body.split(/\r?\n/)
      const titleLine = lines.find((line) => line.startsWith('# '))
      const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : slug
      const content = lines.filter((line) => !line.startsWith('# ')).join('\n').trim()
      const firstParagraph = content.split(/\n\s*\n/).find(Boolean) || ''
      const aliases = Array.isArray(frontmatter.aliases) ? frontmatter.aliases : []

      return {
        slug,
        title,
        aliases,
        summary: stripMarkdown(firstParagraph),
        body: content,
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'))
}

export function createDefinitionLookup(definitions) {
  return definitions.reduce((lookup, definition) => {
    lookup[definition.title] = definition
    definition.aliases.forEach((alias) => {
      lookup[alias] = definition
    })
    return lookup
  }, {})
}
