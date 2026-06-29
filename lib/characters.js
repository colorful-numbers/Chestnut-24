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
//     - [SKIP](#node)      -> jump straight to a node (no button)
//
// Choice weights are a Markov-style distribution (need not sum to 1; the display
// normalizes them). A node with no choices falls through to `defaultNode`; a
// choice whose target node does not exist is treated as `[SKIP](#defaultNode)`.

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

export function parseCharacterMarkdown(source, { id, bgmMap = {} }) {
  const { frontmatter, body } = parseFrontmatter(source)
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
  const starterNode = normalizeId(frontmatter.starterNode)
  const defaultNode = normalizeId(frontmatter.defaultNode)

  let title = frontmatter.title || id
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
        currentScene = { name: text, bg: '', bgm: null }
        sceneNodeCount = 0
        currentNode = null
      } else {
        const nodeId = normalizeId(text)
        const isFirstInScene = sceneNodeCount === 0
        sceneNodeCount += 1
        currentNode = {
          id: nodeId,
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
          to: normalizeId(target),
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
      known.has(choice.to) ? choice : { ...choice, to: defaultNode, skip: true }
    ))

    const graphNode = { background: node.background || '', bgm: node.bgm || null }
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
      text: node.texts.length ? node.texts : [''],
      expressions: node.expressions.length ? node.expressions : [''],
      ...(labels ? { choices: labels } : {}),
    }
  })

  const starter = graph[starterNode] ? starterNode : order[0]
  const starterGraph = graph[starter] || {}

  return {
    title,
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
