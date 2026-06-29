import fs from 'fs'
import path from 'path'
import { renderMarkdown } from './markdownRender'

const VERSIONS_DIR = path.join(process.cwd(), 'docs', 'versions')

function versionTuple(slug) {
  const match = slug.match(/(\d+)\.(\d+)\.(\d+)/)
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [0, 0, 0]
}

// On-site dev notes, sourced from docs/versions/*.md and rendered as blog posts.
// Sorted newest version first (reverse chronological).
export function getDevNotes() {
  if (!fs.existsSync(VERSIONS_DIR)) return []

  return fs.readdirSync(VERSIONS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '')
      const source = fs.readFileSync(path.join(VERSIONS_DIR, file), 'utf8')
      const lines = source.split(/\r?\n/)
      const titleLine = lines.find((line) => line.startsWith('# '))
      const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : slug
      const body = lines.filter((line) => line !== titleLine).join('\n').trim()
      return { slug, version: title, html: renderMarkdown(body), order: versionTuple(slug) }
    })
    .sort((a, b) => {
      for (let i = 0; i < 3; i += 1) {
        if (b.order[i] !== a.order[i]) return b.order[i] - a.order[i]
      }
      return 0
    })
}
