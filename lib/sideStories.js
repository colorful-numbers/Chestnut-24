import fs from 'fs'
import path from 'path'
import { parseFrontmatter, splitTitleAndParagraphs } from './markdown'

const SIDE_STORIES_DIR = path.join(process.cwd(), 'data', 'sideStories')
const LOCALES = ['zh', 'en']

// Each side story is a folder under data/sideStories/<id>/ holding one markdown
// file per language. Shared metadata (time, media, order) and the localized
// kicker live in frontmatter; the body is `# Title` followed by paragraphs.
export function getSideStories() {
  if (!fs.existsSync(SIDE_STORIES_DIR)) return []

  return fs.readdirSync(SIDE_STORIES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const id = entry.name
      const localeData = {}
      let meta = {}

      LOCALES.forEach((lang) => {
        const file = path.join(SIDE_STORIES_DIR, id, `${lang}.md`)
        if (!fs.existsSync(file)) return
        const { frontmatter, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'))
        const { title, paragraphs } = splitTitleAndParagraphs(body, id)
        localeData[lang] = {
          kicker: frontmatter.kicker || '',
          title,
          body: paragraphs[0] || '',
          article: paragraphs,
        }
        const { kicker: _ignored, ...rest } = frontmatter
        meta = { ...meta, ...rest }
      })

      const zh = localeData.zh || localeData.en || { kicker: '', title: id, body: '', article: [] }
      const en = localeData.en || zh

      return {
        id,
        time: meta.time || '',
        media: meta.media || '',
        order: meta.order ? Number(meta.order) : Number.MAX_SAFE_INTEGER,
        zh,
        en,
      }
    })
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
}
