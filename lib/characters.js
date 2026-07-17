import { parseFrontmatter } from './markdown'

// Markdown dialogue format (see docs/content/characters.md):
//
//   # Title                -> character title; the text right under it is `body`
//   ## Scene               -> a scene; `- [BG](file)` / `- [BGM](name)` set its
//                             default background / track. Every node under it
//                             shares the scene.
//   ### Node               -> a dialogue node (id = heading, case-insensitive)
//     ![x](expression.png) -> switch the sprite for the following lines
//     plain line           -> one displayed dialogue line
//     - [BGM](name)        -> change the running track mid-node (persists)
//     - [Label](#node) 0.3 -> a weighted choice; weight defaults to 1
//     - [SKIP](#node) 0.3  -> a weighted jump with no button (weight defaults
//                             to 1)
//
// Choice weights are a Markov-style distribution (need not sum to 1; the display
// normalizes them). SKIP semantics depend on the node:
//   - A node whose only choice is a SKIP is a plain transition (auto-advance).
//   - When SKIP is mixed with normal choices, the display runs one weighted draw
//     over every choice (SKIPs included). If a SKIP wins, it jumps to its target;
//     otherwise the SKIPs are dropped and the normal choices are shown.
// A node with no choices falls through to `defaultNode`; a choice whose target
// node does not exist is treated as `[SKIP](#defaultNode)`.

const HEADING_RE = /^(#{1,3})\s+(.*)$/
// Sprite switch: `![alt](target)`, e.g. `![expression](expression-neutral.png)`
// or `![expression](EMPTY)` to hide the sprite.
const IMAGE_RE = /^!\[[^\]]*\]\(([^)]+)\)\s*$/
const LIST_LINK_RE = /^[-*]\s*\[([^\]]+)\]\(([^)]+)\)\s*([0-9]*\.?[0-9]+)?\s*$/

// Sentinel sprite value meaning "render nothing" until the next switch. Shared
// verbatim with components/CharacterDisplay.jsx.
export const EMPTY_EXPRESSION = 'EMPTY'

function normalizeId(value) {
  return String(value || '').trim().replace(/^#/, '').toLowerCase()
}

function normalizeChapterId(value) {
  return String(value || 'index')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/\.md$/i, '')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase() || 'index'
}

function scopedNodeId(chapterId, nodeId) {
  const normalizedNode = normalizeId(nodeId)
  return chapterId ? `${normalizeChapterId(chapterId)}::${normalizedNode}` : normalizedNode
}

function resolveChapterId(currentChapterId, targetFile) {
  const normalizedTarget = String(targetFile || '').replace(/\\/g, '/').replace(/\.md$/i, '')
  const parts = normalizedTarget.startsWith('/')
    ? []
    : normalizeChapterId(currentChapterId).split('/').slice(0, -1)

  normalizedTarget.split('/').forEach((part) => {
    if (!part || part === '.') return
    if (part === '..') parts.pop()
    else parts.push(part)
  })

  return normalizeChapterId(parts.join('/'))
}

function resolveChoiceTarget(target, chapterId) {
  const value = String(target || '').trim()
  if (value.startsWith('#')) return scopedNodeId(chapterId, value)

  const chapterLink = value.match(/^(.+?\.md)(?:\/?#(.*))?$/i)
  if (chapterLink) {
    return scopedNodeId(resolveChapterId(chapterId, chapterLink[1]), chapterLink[2] || '')
  }

  return scopedNodeId(chapterId, value)
}

function chapterOfNode(nodeId) {
  const separator = String(nodeId || '').indexOf('::')
  return separator === -1 ? '' : nodeId.slice(0, separator)
}

export function parseCharacterMarkdown(source, {
  id,
  bgmMap = {},
  chapterId = '',
  preserveUnknownTargets = false,
}) {
  const { frontmatter, body } = parseFrontmatter(source)
  const normalizedChapterId = chapterId ? normalizeChapterId(chapterId) : ''
  const mediaBase = `/characters/${id}`
  const resolveMedia = (name) => {
    const value = String(name || '').trim()
    if (!value) return ''
    return value.startsWith('/') ? value : `${mediaBase}/${value}`
  }
  const resolveBgm = (name) => bgmMap[String(name || '').trim()] || null
  // Resolve a sprite marker to a media path, or the EMPTY sentinel.
  const toExpression = (name) => {
    const value = String(name || '').trim()
    if (value.toUpperCase() === EMPTY_EXPRESSION) return EMPTY_EXPRESSION
    return resolveMedia(value)
  }

  const defaultExpression = frontmatter.defaultExpression || ''
  const starterNode = scopedNodeId(normalizedChapterId, frontmatter.starterNode)
  const defaultNode = scopedNodeId(normalizedChapterId, frontmatter.defaultNode)

  let title = frontmatter.title || id
  let chapterTitle = frontmatter.chapterTitle || frontmatter.chapter || ''
  const bodyLines = []

  let currentScene = null
  let sceneNodeCount = 0
  let currentNode = null
  let expressionState = toExpression(defaultExpression)

  const nodes = {}
  const order = []

  body.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim()
    if (!line) return

    const heading = line.match(HEADING_RE)
    if (heading) {
      const level = heading[1].length
      const text = heading[2].trim()
      if (level === 1) {
        title = text
        currentScene = null
        currentNode = null
      } else if (level === 2) {
        if (!chapterTitle && normalizedChapterId) chapterTitle = text
        currentScene = { name: text, bg: '', bgm: null }
        sceneNodeCount = 0
        currentNode = null
      } else {
        const nodeId = scopedNodeId(normalizedChapterId, text)
        const isFirstInScene = sceneNodeCount === 0
        sceneNodeCount += 1
        currentNode = {
          id: nodeId,
          chapterId: normalizedChapterId,
          title: text,
          background: currentScene ? currentScene.bg : '',
          bgm: currentScene && isFirstInScene ? currentScene.bgm : null,
          texts: [],
          expressions: [],
          choices: [],
        }
        expressionState = toExpression(defaultExpression)
        nodes[nodeId] = currentNode
        order.push(nodeId)
      }
      return
    }

    const image = line.match(IMAGE_RE)
    if (image) {
      expressionState = toExpression(image[1])
      return
    }

    const listLink = line.match(LIST_LINK_RE)
    if (listLink) {
      const label = listLink[1].trim()
      const target = listLink[2].trim()
      const weight = listLink[3]
      const upper = label.toUpperCase()
      if (upper === 'BG') {
        const resolved = resolveMedia(target)
        if (currentNode) currentNode.background = resolved
        else if (currentScene) currentScene.bg = resolved
      } else if (upper === 'BGM') {
        const resolved = resolveBgm(target)
        if (currentNode) currentNode.bgm = resolved
        else if (currentScene) currentScene.bgm = resolved
      } else if (currentNode) {
        currentNode.choices.push({
          label,
          to: resolveChoiceTarget(target, normalizedChapterId),
          weight: weight != null ? Number(weight) : 1,
          skip: upper === 'SKIP',
        })
      }
      return
    }

    if (currentNode) {
      currentNode.texts.push(line)
      // expressionState is already resolved (a media path or the EMPTY sentinel).
      currentNode.expressions.push(expressionState)
    } else if (currentScene === null) {
      // Text between the H1 title and the first scene is the character blurb.
      bodyLines.push(line)
    }
    // Text under a scene heading but before a node is a scene caption: ignored.
  })

  const known = new Set(order)
  const graph = {}
  const lines = {}

  order.forEach((nodeId) => {
    const node = nodes[nodeId]
    // Unknown choice targets become a skip to the default node.
    const resolvedChoices = node.choices.map((choice) => (
      known.has(choice.to) || preserveUnknownTargets
        ? choice
        : { ...choice, to: defaultNode, skip: true }
    ))

    const graphNode = {
      chapterId: normalizedChapterId,
      background: node.background || '',
      bgm: node.bgm || null,
    }
    let labels

    if (resolvedChoices.length === 0) {
      graphNode.next = defaultNode
    } else if (resolvedChoices.length === 1 && resolvedChoices[0].skip) {
      graphNode.next = resolvedChoices[0].to
    } else {
      graphNode.choices = resolvedChoices.map((choice) => ({
        to: choice.to,
        weight: Number.isFinite(choice.weight) ? choice.weight : 1,
        skip: !!choice.skip,
      }))
      labels = resolvedChoices.map((choice) => choice.label)
    }

    graph[nodeId] = graphNode
    lines[nodeId] = {
      title: node.title,
      chapterId: normalizedChapterId,
      chapterTitle,
      text: node.texts.length ? node.texts : [''],
      expressions: node.expressions.length ? node.expressions : [''],
      ...(labels ? { choices: labels } : {}),
    }
  })

  const starter = graph[starterNode] ? starterNode : order[0]
  const starterGraph = graph[starter] || {}

  return {
    title,
    chapterId: normalizedChapterId,
    chapterTitle: chapterTitle || normalizedChapterId || title,
    speaker: frontmatter.speaker || title,
    body: bodyLines.join('\n').trim(),
    starterNode: starter,
    defaultNode: graph[defaultNode] ? defaultNode : starter,
    defaultExpressionSrc: resolveMedia(defaultExpression),
    defaultBackground: starterGraph.background || '',
    defaultBgm: starterGraph.bgm || resolveBgm(frontmatter.defaultBGM),
    graph,
    lines,
  }
}

// Parse a locale's chapter files into one namespaced dialogue graph. Local
// `#node` links stay inside their file; `./chapter.md/#node` links cross files.
// A stale anchor in an existing chapter lands at that chapter's starter node.
export function parseCharacterChapters(chapters, options) {
  if (!Array.isArray(chapters) || chapters.length === 0) return null

  const parsedChapters = chapters.map((chapter) => parseCharacterMarkdown(chapter.source, {
    ...options,
    chapterId: chapter.id,
    preserveUnknownTargets: true,
  }))
  const entry = parsedChapters.find((chapter) => chapter.chapterId === 'index') || parsedChapters[0]
  const graph = Object.assign({}, ...parsedChapters.map((chapter) => chapter.graph))
  const lines = Object.assign({}, ...parsedChapters.map((chapter) => chapter.lines))
  const chapterMap = Object.fromEntries(parsedChapters.map((chapter) => [chapter.chapterId, chapter]))
  const globalFallback = entry.defaultNode || entry.starterNode

  const fallbackFor = (target, sourceChapterId) => {
    const targetChapterId = chapterOfNode(target)
    const targetChapter = chapterMap[targetChapterId]
    if (targetChapter && targetChapterId !== sourceChapterId) return targetChapter.starterNode
    return chapterMap[sourceChapterId]?.defaultNode || globalFallback
  }

  Object.values(graph).forEach((node) => {
    if (node.next && !graph[node.next]) node.next = fallbackFor(node.next, node.chapterId)
    if (!Array.isArray(node.choices)) return
    node.choices = node.choices.map((choice) => (
      graph[choice.to]
        ? choice
        : { ...choice, to: fallbackFor(choice.to, node.chapterId), skip: true }
    ))
  })

  const entryStarter = graph[entry.starterNode] ? entry.starterNode : Object.keys(entry.graph)[0]
  const starterGraph = graph[entryStarter] || {}

  return {
    ...entry,
    starterNode: entryStarter,
    defaultNode: graph[entry.defaultNode] ? entry.defaultNode : entryStarter,
    defaultBackground: starterGraph.background || entry.defaultBackground,
    defaultBgm: starterGraph.bgm || entry.defaultBgm,
    graph,
    lines,
    chapters: parsedChapters.map((chapter) => ({
      id: chapter.chapterId,
      title: chapter.chapterTitle,
      starterNode: chapter.starterNode,
    })),
  }
}
