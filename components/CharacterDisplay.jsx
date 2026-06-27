import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronsRight, History, Pause, Play, SkipForward, Undo2, X } from 'lucide-react'
import Typing from './Typing'
import DefinitionText from './DefinitionText'
import BgmPlayer from './BgmPlayer'

const AUTO_DELAY = 1100

function isDecisionNode(node) {
  return Array.isArray(node?.choices) && node.choices.length >= 2
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
  const graph = character.graph || {}

  const [isOpen, setIsOpen] = useState(autoOpen)
  const [stateId, setStateId] = useState(character.defaultState)
  const [history, setHistory] = useState([])
  const [autoPlay, setAutoPlay] = useState(false)
  const [instant, setInstant] = useState(false)
  const [lineDone, setLineDone] = useState(false)
  const [showBacklog, setShowBacklog] = useState(false)
  const [prevBackground, setPrevBackground] = useState(character.background || '')

  const node = graph[stateId] || graph[character.defaultState]
  const line = copy.lines?.[stateId] || {}
  const isDecision = isDecisionNode(node)
  const hasNext = typeof node?.next === 'string'

  const choices = useMemo(() => {
    if (!isDecision) return []
    return node.choices.map((choice, index) => ({
      to: choice.to,
      label: (line.choices && line.choices[index]) || '…',
    }))
  }, [isDecision, node, line])

  // Resolve the active scene (background + bgm) by replaying the visited path so
  // carried-forward values stay correct even after backlog jumps.
  const scene = useMemo(() => {
    let background = character.background || ''
    let bgm = character.defaultBgm || null
    for (const id of [...history, stateId]) {
      const visited = graph[id]
      if (visited?.background) background = visited.background
      if (visited?.bgm) bgm = visited.bgm
    }
    return { background, bgm }
  }, [history, stateId, graph, character.background, character.defaultBgm])

  useEffect(() => {
    setInstant(false)
    setLineDone(false)
  }, [stateId, locale])

  const advance = () => {
    if (!hasNext) return
    setHistory((current) => [...current, stateId])
    setStateId(node.next)
  }

  const choose = (to) => {
    setHistory((current) => [...current, stateId])
    setStateId(to)
  }

  // Auto play reads sentence nodes only and pauses on decision / end nodes.
  useEffect(() => {
    if (!isOpen || !autoPlay) return undefined
    if (isDecision || !hasNext || !lineDone) return undefined
    const timer = window.setTimeout(advance, AUTO_DELAY)
    return () => window.clearTimeout(timer)
  }, [isOpen, autoPlay, isDecision, hasNext, lineDone, stateId])

  const nextSentence = () => {
    if (!isDecision && hasNext) advance()
  }

  // Skip forward through sentence nodes, stopping at the next decision or end.
  const nextChoice = () => {
    if (isDecision || !hasNext) return
    let cursor = stateId
    const steps = []
    let guard = 0
    while (guard < 200) {
      guard += 1
      const current = graph[cursor]
      if (isDecisionNode(current)) break
      if (typeof current?.next !== 'string') break
      steps.push(cursor)
      cursor = current.next
    }
    if (steps.length) {
      setHistory((current) => [...current, ...steps])
      setStateId(cursor)
    }
  }

  const backToLastSentence = () => {
    setHistory((current) => {
      if (current.length === 0) return current
      setStateId(current[current.length - 1])
      return current.slice(0, -1)
    })
  }

  const backToLastChoice = () => {
    for (let index = history.length - 1; index >= 0; index -= 1) {
      if (isDecisionNode(graph[history[index]])) {
        setStateId(history[index])
        setHistory(history.slice(0, index))
        return
      }
    }
    if (history.length) {
      setStateId(history[0])
      setHistory([])
    }
  }

  const jumpTo = (index) => {
    setStateId(history[index])
    setHistory(history.slice(0, index))
    setShowBacklog(false)
  }

  const resetConversation = () => {
    setHistory([])
    setStateId(character.defaultState)
    setAutoPlay(false)
    setShowBacklog(false)
  }

  // Clicking the dialogue text reveals it instantly, then advances sentences.
  const onDialogClick = () => {
    if (!lineDone) {
      setInstant(true)
      return
    }
    if (!isDecision && hasNext) advance()
  }

  const controls = copy.controls || {}

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
      <div className="character-stage">
        <div className="character-stage__bg-layer" aria-hidden="true">
          <div
            className="character-stage__bg character-stage__bg--prev"
            style={prevBackground ? { backgroundImage: `url('${prevBackground}')` } : undefined}
          />
          <img
            key={scene.background}
            className="character-stage__bg character-stage__bg--next"
            src={scene.background}
            alt=""
            draggable="false"
            onAnimationEnd={() => setPrevBackground(scene.background)}
          />
        </div>
        <img className="character-display__main" src={character.mainCg} alt={copy.mainAlt} />

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

        {isDecision && (
          <div className="dialog-choices" aria-label={copy.choiceLabel}>
            {choices.map((choice) => (
              <button key={`${stateId}-${choice.to}`} type="button" onClick={() => choose(choice.to)}>
                {choice.label}
              </button>
            ))}
          </div>
        )}

        <div className="dialog-controls" aria-label={copy.controlsLabel}>
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
            disabled={isDecision || !hasNext}
          >
            <ChevronsRight size={18} />
          </button>
          <button
            type="button"
            className="dialog-controls__btn"
            data-tip={controls.nextChoice}
            aria-label={controls.nextChoice}
            onClick={nextChoice}
            disabled={isDecision || !hasNext}
          >
            <SkipForward size={18} />
          </button>
        </div>

        <div
          className="dialog-window"
          role="button"
          tabIndex={0}
          onClick={onDialogClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onDialogClick()
            }
          }}
        >
          <div className="dialog-window__speaker">
            <span>{copy.speaker}</span>
            <strong>{line.title}</strong>
          </div>
          <p>
            <Typing
              instant={instant}
              onDone={() => setLineDone(true)}
              renderText={(value) => <DefinitionText definitions={definitions}>{value}</DefinitionText>}
            >
              {line.text}
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
              {history.map((id, index) => {
                const entry = copy.lines?.[id] || {}
                return (
                  <li key={`${id}-${index}`}>
                    <button type="button" onClick={() => jumpTo(index)} title={copy.backlog?.jump}>
                      <span className="dialog-backlog__speaker">{entry.title || copy.speaker}</span>
                      <span className="dialog-backlog__text">{entry.text}</span>
                    </button>
                  </li>
                )
              })}
              <li className="dialog-backlog__current">
                <span className="dialog-backlog__speaker">{line.title || copy.speaker} · {copy.backlog?.current}</span>
                <span className="dialog-backlog__text">{line.text}</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </article>
  )
}
