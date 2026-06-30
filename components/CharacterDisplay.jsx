import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronsRight, History, Keyboard, Pause, Play, SkipForward, Undo2, X } from 'lucide-react'
import Typing from './Typing'
import RichText from './RichText'
import DefinitionText from './DefinitionText'
import BgmPlayer from './BgmPlayer'
import { EFFECTS } from '../lib/effects'

const AUTO_DELAY = 1100
const SKIP_DELAY = 28
const WHEEL_COOLDOWN = 220
const MAX_VISIBLE_CHOICES = 3
// Sentinel sprite value meaning "render nothing"; matches lib/characters.js.
const EMPTY_EXPRESSION = 'EMPTY'

// Configurable typing speed (ms per character). `instant` reveals the whole line.
const TYPING_SPEEDS = { slow: 52, normal: 28, fast: 12, instant: 0 }
const SPEED_ORDER = ['slow', 'normal', 'fast', 'instant']
const SPEED_STORAGE_KEY = 'chestnut-dialogue-speed'

// Expression-change crossfade. Toggle with EFFECTS.expressionTransition. Tune the
// two durations here (the outgoing fade-out and the incoming fade-in); the prev
// layer is retired once the slower of the two has finished.
const ENABLE_SPRITE_TRANSITION = EFFECTS.expressionTransition
const SPRITE_FADEOUT_MS = 1300
const SPRITE_FADEIN_MS = 1200
const SPRITE_FADE_MS = Math.max(SPRITE_FADEOUT_MS, SPRITE_FADEIN_MS) + 100

function hasChoices(node) {
  return Array.isArray(node?.choices) && node.choices.length >= 1
}

function sentencesOf(copy, nodeId) {
  const text = copy?.lines?.[nodeId]?.text
  if (Array.isArray(text)) return text
  if (typeof text === 'string' && text.length) return [text]
  return ['']
}

// Weighted sampling without replacement. Returns `count` distinct indices drawn
// from `weights` (a Markov-style distribution), favouring higher weights.
function sampleWeightedIndices(weights, count) {
  const pool = weights.map((weight, index) => ({ index, weight: weight > 0 ? weight : 0 }))
  const picked = []
  while (picked.length < count && pool.length) {
    const total = pool.reduce((sum, item) => sum + item.weight, 0)
    let roll = Math.random() * (total > 0 ? total : pool.length)
    let chosen = pool.length - 1
    for (let i = 0; i < pool.length; i += 1) {
      roll -= total > 0 ? pool[i].weight : 1
      if (roll <= 0) {
        chosen = i
        break
      }
    }
    picked.push(pool[chosen].index)
    pool.splice(chosen, 1)
  }
  return picked.sort((a, b) => a - b)
}

export default function CharacterDisplay({
  character,
  locale,
  definitions = [],
  autoOpen = false,
  fullscreen = false,
  backHref,
}) {
  const copy = character.locales?.[locale] || character.locales?.zh
  const graph = copy.graph || {}
  const starterNode = copy.starterNode

  const [isOpen, setIsOpen] = useState(autoOpen)
  const [stateId, setStateId] = useState(starterNode)
  const [lineIndex, setLineIndex] = useState(0)
  const [history, setHistory] = useState([])
  const [autoPlay, setAutoPlay] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [instant, setInstant] = useState(false)
  const [lineDone, setLineDone] = useState(false)
  const [showBacklog, setShowBacklog] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [hideUi, setHideUi] = useState(false)
  const [speedKey, setSpeedKey] = useState('normal')
  const [prevBackground, setPrevBackground] = useState(copy.defaultBackground || '')
  const [prevExpression, setPrevExpression] = useState('')

  const stageRef = useRef(null)

  // Restore the saved typing speed once on mount, then persist on change.
  useEffect(() => {
    const saved = typeof window !== 'undefined' && window.localStorage.getItem(SPEED_STORAGE_KEY)
    if (saved && TYPING_SPEEDS[saved] != null) setSpeedKey(saved)
  }, [])

  const chooseSpeed = (key) => {
    setSpeedKey(key)
    if (typeof window !== 'undefined') window.localStorage.setItem(SPEED_STORAGE_KEY, key)
  }

  const node = graph[stateId] || graph[starterNode]
  const line = copy.lines?.[stateId] || {}
  const sentences = sentencesOf(copy, stateId)
  const currentText = sentences[lineIndex] || ''
  const atLastLine = lineIndex >= sentences.length - 1

  const isDecision = atLastLine && hasChoices(node)
  const canAdvanceNode = !hasChoices(node) && typeof node?.next === 'string'
  const hasMoreLines = lineIndex < sentences.length - 1
  const canStep = hasMoreLines || canAdvanceNode

  // The sprite for the current line, resolved from per-line expression markers.
  // EMPTY hides the sprite entirely until the next switch.
  const rawExpression = (line.expressions && line.expressions[lineIndex]) ?? ''
  const hideSprite = rawExpression === EMPTY_EXPRESSION
  const expressionSrc = hideSprite
    ? ''
    : (rawExpression || copy.defaultExpressionSrc || character.mainCg)

  // Resolve how the node's choices are presented, rolled once per node visit
  // (keyed on stateId) so the outcome stays stable while the node's lines play.
  //
  // SKIP rule: a node may mix `[SKIP]` choices with normal ones. SKIPs are not
  // auto-followed just for being present. Every choice — SKIPs and normals
  // alike — joins one weighted draw, each defaulting to weight 1. If a SKIP wins
  // the draw, jump straight to its target. Otherwise the SKIPs are dropped and
  // the remaining normal choices are presented as buttons (sampled to the cap).
  const choicePlan = useMemo(() => {
    const all = node?.choices || []
    if (!all.length) return { skipTo: null, indices: [] }

    const weightOf = (choice) => {
      const weight = Number(choice.weight)
      return Number.isFinite(weight) ? weight : 1
    }

    // One-time weighted selection across all choices, SKIPs included.
    const drawn = sampleWeightedIndices(all.map(weightOf), 1)[0]
    if (drawn != null && all[drawn].skip) {
      return { skipTo: all[drawn].to, indices: [] }
    }

    // No SKIP selected: present the non-skip choices, sampled to the cap.
    const normalIndices = all.reduce((acc, choice, index) => {
      if (!choice.skip) acc.push(index)
      return acc
    }, [])
    if (normalIndices.length <= MAX_VISIBLE_CHOICES) return { skipTo: null, indices: normalIndices }
    const sampled = sampleWeightedIndices(normalIndices.map((index) => weightOf(all[index])), MAX_VISIBLE_CHOICES)
    return { skipTo: null, indices: sampled.map((i) => normalIndices[i]) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateId])

  const visibleChoices = useMemo(() => {
    if (!isDecision) return []
    return choicePlan.indices.map((index) => ({
      to: node.choices[index].to,
      label: (line.choices && line.choices[index]) || '…',
    }))
  }, [isDecision, choicePlan, node, line])

  const autoSkipTo = isDecision ? choicePlan.skipTo : null
  const choicesShown = isDecision && !autoSkipTo && visibleChoices.length > 0

  // Resolve the active scene (background + bgm) by replaying the visited path so
  // carried-forward values stay correct even after backlog jumps.
  const scene = useMemo(() => {
    let background = copy.defaultBackground || ''
    let bgm = copy.defaultBgm || null
    const path = [...history.map((entry) => entry.node), stateId]
    for (const id of path) {
      const visited = graph[id]
      if (visited?.background) background = visited.background
      if (visited?.bgm) bgm = visited.bgm
    }
    return { background, bgm }
  }, [history, stateId, graph, copy.defaultBackground, copy.defaultBgm])

  useEffect(() => {
    setInstant(false)
    setLineDone(false)
  }, [stateId, lineIndex, locale])

  // After a sprite swap finishes animating, retire the outgoing layer.
  useEffect(() => {
    const timer = window.setTimeout(() => setPrevExpression(expressionSrc), SPRITE_FADE_MS)
    return () => window.clearTimeout(timer)
  }, [expressionSrc])

  // Every image this character can show (all expressions + backgrounds). Warming
  // the browser cache up front keeps the crossfade smooth instead of popping in
  // when an as-yet-unloaded expression is first revealed (notably on desktop,
  // where the assets are not already cached from a card preview).
  const preloadAssets = useMemo(() => {
    const urls = new Set()
    if (character.mainCg) urls.add(character.mainCg)
    if (copy.defaultExpressionSrc) urls.add(copy.defaultExpressionSrc)
    if (copy.defaultBackground) urls.add(copy.defaultBackground)
    Object.values(copy.lines || {}).forEach((entry) => {
      ;(entry.expressions || []).forEach((src) => {
        if (src && src !== EMPTY_EXPRESSION) urls.add(src)
      })
    })
    Object.values(graph).forEach((entry) => {
      if (entry?.background) urls.add(entry.background)
    })
    return [...urls]
  }, [copy, graph, character.mainCg])

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return
    preloadAssets.forEach((src) => {
      const image = new window.Image()
      image.decoding = 'async'
      image.src = src
    })
  }, [isOpen, preloadAssets])

  const pushHistory = () => {
    setHistory((current) => [...current, { node: stateId, line: lineIndex }])
  }

  const advance = () => {
    if (hasMoreLines) {
      pushHistory()
      setLineIndex((index) => index + 1)
    } else if (canAdvanceNode) {
      pushHistory()
      setStateId(node.next)
      setLineIndex(0)
    }
  }

  const choose = (to) => {
    pushHistory()
    setStateId(to)
    setLineIndex(0)
  }

  // Auto play and Ctrl-skip both walk sentence nodes and pause on decisions /
  // endings. Skip runs fast and does not wait for the line to finish typing
  // (the line is revealed instantly while skipping); auto play waits.
  useEffect(() => {
    if (!isOpen || (!autoPlay && !skipping)) return undefined
    if (isDecision || !canStep) return undefined
    if (autoPlay && !skipping && !lineDone) return undefined
    const timer = window.setTimeout(advance, skipping ? SKIP_DELAY : AUTO_DELAY)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoPlay, skipping, isDecision, canStep, lineDone, stateId, lineIndex])

  // SKIP auto-advance once the current line has finished typing.
  useEffect(() => {
    if (!isOpen || !isDecision || !autoSkipTo || !lineDone) return undefined
    const timer = window.setTimeout(() => choose(autoSkipTo), AUTO_DELAY / 2)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isDecision, autoSkipTo, lineDone, stateId])

  const nextSentence = () => {
    if (!isDecision && canStep) advance()
  }

  // Skip forward through sentences and scene transitions, stopping at the next
  // decision (its last line) or an ending.
  const nextChoice = () => {
    let nodeId = stateId
    let li = lineIndex
    const steps = []
    let guard = 0
    while (guard < 500) {
      guard += 1
      const current = graph[nodeId]
      const last = li >= sentencesOf(copy, nodeId).length - 1
      if (last && hasChoices(current)) break
      if (!last) {
        steps.push({ node: nodeId, line: li })
        li += 1
        continue
      }
      if (typeof current?.next === 'string') {
        steps.push({ node: nodeId, line: li })
        nodeId = current.next
        li = 0
        continue
      }
      break
    }
    if (steps.length) {
      setHistory((current) => [...current, ...steps])
      setStateId(nodeId)
      setLineIndex(li)
    }
  }

  const backToLastSentence = () => {
    setHistory((current) => {
      if (current.length === 0) return current
      const previous = current[current.length - 1]
      setStateId(previous.node)
      setLineIndex(previous.line)
      return current.slice(0, -1)
    })
  }

  const backToLastChoice = () => {
    for (let index = history.length - 1; index >= 0; index -= 1) {
      const entry = history[index]
      const last = entry.line >= sentencesOf(copy, entry.node).length - 1
      if (last && hasChoices(graph[entry.node])) {
        setStateId(entry.node)
        setLineIndex(entry.line)
        setHistory(history.slice(0, index))
        return
      }
    }
    if (history.length) {
      const first = history[0]
      setStateId(first.node)
      setLineIndex(first.line)
      setHistory([])
    }
  }

  const jumpTo = (index) => {
    const entry = history[index]
    setStateId(entry.node)
    setLineIndex(entry.line)
    setHistory(history.slice(0, index))
    setShowBacklog(false)
  }

  const resetConversation = () => {
    setHistory([])
    setStateId(starterNode)
    setLineIndex(0)
    setAutoPlay(false)
    setShowBacklog(false)
  }

  // Clicking the dialogue text reveals it instantly, then advances sentences.
  const onDialogClick = () => {
    if (!lineDone) {
      setInstant(true)
      return
    }
    if (!isDecision && canStep) advance()
  }

  // Right-click toggles a clean "view the art" mode that hides the dialogue chrome.
  const onContextMenu = (event) => {
    event.preventDefault()
    setShowHints(false)
    setHideUi((current) => !current)
  }

  // The window key/wheel listeners are bound once per open; they read the latest
  // handlers and flags through this ref so they never close over stale state.
  const actionsRef = useRef(null)
  actionsRef.current = {
    onDialogClick,
    goPrev: backToLastSentence,
    showHints,
    showBacklog,
    toggleAuto: () => setAutoPlay((current) => !current),
    toggleHints: () => setShowHints((current) => !current),
    closeBacklog: () => setShowBacklog(false),
    startSkip: () => setSkipping(true),
    stopSkip: () => setSkipping(false),
  }

  useEffect(() => {
    if (!isOpen) return undefined
    let lastWheel = 0

    const onKeyDown = (event) => {
      const actions = actionsRef.current
      const target = event.target
      const interactive = target && (
        ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(target.tagName)
        || target.isContentEditable
        || target.getAttribute?.('role') === 'button'
      )

      if (event.key === 'Control') {
        actions.startSkip()
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        if (actions.showBacklog) actions.closeBacklog()
        else actions.toggleHints()
        return
      }
      // Let a focused control keep its own Space/Enter/letter behaviour.
      if (interactive || actions.showHints) return
      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault()
        if (!event.repeat && !actions.showBacklog) actions.onDialogClick()
        return
      }
      if ((event.key === 'a' || event.key === 'A') && !event.ctrlKey && !event.metaKey && !event.altKey && !event.repeat) {
        actions.toggleAuto()
      }
    }

    const onKeyUp = (event) => {
      if (event.key === 'Control') actionsRef.current.stopSkip()
    }
    // Releasing Ctrl outside the window never fires keyup, so stop on blur too.
    const onBlur = () => actionsRef.current.stopSkip()

    const onWheel = (event) => {
      const actions = actionsRef.current
      if (actions.showHints || actions.showBacklog) return
      event.preventDefault()
      const now = Date.now()
      if (now - lastWheel < WHEEL_COOLDOWN) return
      lastWheel = now
      if (event.deltaY > 0) actions.onDialogClick()
      else if (event.deltaY < 0) actions.goPrev()
    }

    const stage = stageRef.current
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    if (stage) stage.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      if (stage) stage.removeEventListener('wheel', onWheel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const typingInstant = instant || skipping || speedKey === 'instant'
  const typingSpeed = TYPING_SPEEDS[speedKey] || TYPING_SPEEDS.normal

  const controls = copy.controls || {}
  const hints = copy.hints || {}

  if (!isOpen) {
    return (
      <article className="character-display">
        <button
          type="button"
          className="character-display__stage"
          style={scene.background ? { backgroundImage: `url('${scene.background}')` } : undefined}
          onClick={() => setIsOpen(true)}
          aria-label={copy.openLabel}
        >
          <img loading="lazy" className="character-display__main" src={character.mainCg} alt={copy.mainAlt} />
          <span className="character-display__prompt">{copy.openLabel}</span>
        </button>
      </article>
    )
  }

  return (
    <article className={`character-display character-display--open ${fullscreen ? 'character-display--modal' : ''}`}>
      <div
        ref={stageRef}
        className={`character-stage ${hideUi ? 'character-stage--bare' : ''}`}
        onContextMenu={onContextMenu}
      >
        <div className="character-stage__bg-layer" aria-hidden="true">
          {prevBackground && prevBackground !== scene.background && (
            <img
              key={`bg-prev-${prevBackground}`}
              className="character-stage__bg character-stage__bg--prev"
              src={prevBackground}
              alt=""
              draggable="false"
            />
          )}
          <img
            key={scene.background}
            className="character-stage__bg character-stage__bg--next"
            src={scene.background}
            alt=""
            draggable="false"
            onAnimationEnd={() => setPrevBackground(scene.background)}
          />
        </div>

        <div className="character-stage__sprite-layer" aria-hidden="true">
          {ENABLE_SPRITE_TRANSITION && prevExpression && prevExpression !== expressionSrc && (
            <img
              key={`sprite-prev-${prevExpression}`}
              className="character-display__main character-stage__sprite character-stage__sprite--prev"
              style={{ '--sprite-out': `${SPRITE_FADEOUT_MS}ms` }}
              src={prevExpression}
              alt=""
              draggable="false"
            />
          )}
          {!hideSprite && expressionSrc && (
            <img
              key={`sprite-${expressionSrc}`}
              className={`character-display__main character-stage__sprite ${ENABLE_SPRITE_TRANSITION ? 'character-stage__sprite--next' : ''}`}
              style={ENABLE_SPRITE_TRANSITION ? { '--sprite-in': `${SPRITE_FADEIN_MS}ms` } : undefined}
              src={expressionSrc}
              alt={copy.mainAlt}
              draggable="false"
            />
          )}
        </div>

        {!hideUi && (
        <>
        {backHref && (
          <Link href={backHref} className="character-stage__back" aria-label={copy.back}>
            <ArrowLeft size={16} />
            <span>{copy.back}</span>
          </Link>
        )}

        <BgmPlayer
          track={scene.bgm}
          labels={copy.music}
          trackNames={copy.tracks}
          className="character-stage__bgm"
        />

        {choicesShown && (
          <div className="dialog-choices" aria-label={copy.choiceLabel}>
            {visibleChoices.map((choice) => (
              <button key={`${stateId}-${choice.to}`} type="button" onClick={() => choose(choice.to)}>
                {choice.label}
              </button>
            ))}
          </div>
        )}

        <div className={`dialog-controls ${choicesShown ? 'dialog-controls--choosing' : ''}`} aria-label={copy.controlsLabel}>
          <button
            type="button"
            className="dialog-controls__btn"
            data-tip={controls.lastChoice}
            aria-label={controls.lastChoice}
            onClick={backToLastChoice}
            disabled={history.length === 0}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="dialog-controls__btn"
            data-tip={controls.lastSentence}
            aria-label={controls.lastSentence}
            onClick={backToLastSentence}
            disabled={history.length === 0}
          >
            <Undo2 size={18} />
          </button>
          <button
            type="button"
            className={`dialog-controls__btn ${showBacklog ? 'is-active' : ''}`}
            data-tip={controls.backlog}
            aria-label={controls.backlog}
            onClick={() => setShowBacklog((current) => !current)}
          >
            <History size={18} />
          </button>
          <button
            type="button"
            className={`dialog-controls__btn ${autoPlay ? 'is-active' : ''}`}
            data-tip={autoPlay ? controls.autoStop : controls.auto}
            aria-label={autoPlay ? controls.autoStop : controls.auto}
            onClick={() => setAutoPlay((current) => !current)}
          >
            {autoPlay ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            type="button"
            className="dialog-controls__btn"
            data-tip={controls.nextSentence}
            aria-label={controls.nextSentence}
            onClick={nextSentence}
            disabled={isDecision || !canStep}
          >
            <ChevronsRight size={18} />
          </button>
          <button
            type="button"
            className="dialog-controls__btn"
            data-tip={controls.nextChoice}
            aria-label={controls.nextChoice}
            onClick={nextChoice}
            disabled={isDecision || !canStep}
          >
            <SkipForward size={18} />
          </button>
          <button
            type="button"
            className={`dialog-controls__btn ${showHints ? 'is-active' : ''}`}
            data-tip={hints.open}
            aria-label={hints.open}
            onClick={() => setShowHints((current) => !current)}
          >
            <Keyboard size={18} />
          </button>
        </div>

        <div
          className="dialog-window"
          onClick={onDialogClick}
        >
          <div className="dialog-window__speaker">
            <span>{copy.speaker}</span>
            <strong>{line.title}</strong>
          </div>
          <p>
            <Typing
              instant={typingInstant}
              speed={typingSpeed}
              onDone={() => setLineDone(true)}
              renderText={(value) => <DefinitionText definitions={definitions}>{value}</DefinitionText>}
            >
              {currentText}
            </Typing>
          </p>
        </div>

        {showBacklog && (
          <div className="dialog-backlog" role="dialog" aria-label={copy.backlog?.title}>
            <div className="dialog-backlog__head">
              <strong>{copy.backlog?.title}</strong>
              <div className="dialog-backlog__head-actions">
                <button type="button" onClick={resetConversation}>{copy.backlog?.reset}</button>
                <button type="button" aria-label={copy.backlog?.close} onClick={() => setShowBacklog(false)}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <ol className="dialog-backlog__list">
              {history.length === 0 && (
                <li className="dialog-backlog__empty">{copy.backlog?.empty}</li>
              )}
              {history.map((entry, index) => {
                const entryLine = copy.lines?.[entry.node] || {}
                const entrySentences = sentencesOf(copy, entry.node)
                return (
                  <li key={`${entry.node}-${entry.line}-${index}`}>
                    <button type="button" onClick={() => jumpTo(index)} title={copy.backlog?.jump}>
                      <span className="dialog-backlog__speaker">{entryLine.title || copy.speaker}</span>
                      <span className="dialog-backlog__text">
                        <RichText definitions={definitions}>{entrySentences[entry.line]}</RichText>
                      </span>
                    </button>
                  </li>
                )
              })}
              <li className="dialog-backlog__current">
                <span className="dialog-backlog__speaker">{line.title || copy.speaker} · {copy.backlog?.current}</span>
                <span className="dialog-backlog__text">
                  <RichText definitions={definitions}>{currentText}</RichText>
                </span>
              </li>
            </ol>
          </div>
        )}
        </>
        )}

        {hideUi && hints.restore && (
          <p className="character-stage__restore">{hints.restore}</p>
        )}

        {showHints && (
          <div
            className="dialog-hints"
            role="dialog"
            aria-label={hints.title}
            onClick={() => setShowHints(false)}
          >
            <div className="dialog-hints__panel" onClick={(event) => event.stopPropagation()}>
              <div className="dialog-hints__head">
                <strong>{hints.title}</strong>
                <button type="button" aria-label={hints.close} onClick={() => setShowHints(false)}>
                  <X size={16} />
                </button>
              </div>
              <dl className="dialog-hints__keys">
                {(hints.keys || []).map((row) => (
                  <div key={row.key}>
                    <dt>{row.key}</dt>
                    <dd>{row.desc}</dd>
                  </div>
                ))}
              </dl>
              <div className="dialog-hints__speed">
                <span>{hints.speed}</span>
                <div className="dialog-hints__speed-options">
                  {SPEED_ORDER.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={speedKey === key ? 'is-active' : ''}
                      onClick={() => chooseSpeed(key)}
                    >
                      {hints.speeds?.[key] || key}
                    </button>
                  ))}
                </div>
              </div>
              <p className="dialog-hints__note">{hints.save}</p>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
