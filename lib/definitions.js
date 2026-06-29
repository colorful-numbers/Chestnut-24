import fs from 'fs'
import path from 'path'
import { parseFrontmatter, splitTitleAndParagraphs, stripMarkdown } from './markdown'

const DEFINITIONS_DIR = path.join(process.cwd(), 'data', 'definitions')
const LOCALES = ['zh', 'en']

// Each definition is a folder under data/definitions/<slug>/ holding one
// markdown file per language (zh.md, en.md). Frontmatter carries non-rendered
// metadata (aliases and any extra attributes); the body holds localized prose.
export function getDefinitions() {
  if (!fs.existsSync(DEFINITIONS_DIR)) return []

  return fs.readdirSync(DEFINITIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const slug = entry.name
      const localeData = {}
      let aliases = []
      let meta = {}

      LOCALES.forEach((lang) => {
        const file = path.join(DEFINITIONS_DIR, slug, `${lang}.md`)
        if (!fs.existsSync(file)) return
        const { frontmatter, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'))
        const { title, paragraphs, content } = splitTitleAndParagraphs(body, slug)
        localeData[lang] = {
          title,
          summary: stripMarkdown(paragraphs[0] || ''),
          body: content,
        }
        if (Array.isArray(frontmatter.aliases)) aliases = aliases.concat(frontmatter.aliases)
        const { aliases: _ignored, ...rest } = frontmatter
        meta = { ...meta, ...rest }
      })

      const zh = localeData.zh || localeData.en || { title: slug, summary: '', body: '' }
      const en = localeData.en || zh
      // Lookup is language-neutral: include every alias plus each locale title so
      // both 【奇迹】 and 【Miracle】 resolve to the same definition.
      const uniqueAliases = Array.from(
        new Set([...aliases, zh.title, en.title].filter(Boolean)),
      )

      return { slug, aliases: uniqueAliases, meta, zh, en }
    })
    .sort((a, b) => a.zh.title.localeCompare(b.zh.title, 'zh-Hans-CN'))
}

export function createDefinitionLookup(definitions) {
  return definitions.reduce((lookup, definition) => {
    definition.aliases.forEach((alias) => {
      lookup[alias] = definition
    })
    return lookup
  }, {})
}
