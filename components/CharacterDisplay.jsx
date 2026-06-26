import { useEffect, useMemo, useState } from 'react'
import { ChevronsRight, Pause, Play, RotateCcw, StepForward, Undo2 } from 'lucide-react'
import Typing from './Typing'
import DefinitionText from './DefinitionText'

export default function CharacterDisplay({ character, locale, definitions = [] }) {
  const copy = character.locales?.[locale] || character.locales?.zh || character[locale] || character.zh
  const [isOpen, setIsOpen] = useState(false)
  const [stateId, setStateId] = useState(character.defaultState)
  const [history, setHistory] = useState([])
  const [autoPlay, setAutoPlay] = useState(false)
  const [instant, setInstant] = useState(false)
  const state = copy.states[stateId] || copy.states[character.defaultState]
  const expression = character.expressions[state.expression] || character.expressions.neutral
  const stageBackground = state.background || character.background || ''

  const choices = useMemo(() => state.choices || [], [state])

  useEffect(() => {
    setInstant(false)
  }, [stateId, locale])

  useEffect(() => {
    if (!isOpen || !autoPlay || choices.length === 0) return undefined
    const timer = window.setTimeout(() => {
      setHistory((current) => [...current, stateId])
      setStateId(choices[0].next)
    }, 3600)
    return () => window.clearTimeout(timer)
  }, [autoPlay, choices, isOpen, stateId])

  const choose = (nextState) => {
    setHistory((current) => [...current, stateId])
    setStateId(nextState)
  }

  const backToLastChoice = () => {
    setHistory((current) => {
      if (current.length === 0) return current
      const nextHistory = current.slice(0, -1)
      setStateId(current[current.length - 1])
      return nextHistory
    })
  }

  const resetConversation = () => {
    setHistory([])
    setStateId(character.defaultState)
    setAutoPlay(false)
  }

  const skipToNextChoice = () => {
    if (choices[0]) choose(choices[0].next)
  }

  return (
    <article className="character-display">
      <button
        type="button"
        className="character-display__stage"
        style={stageBackground ? { backgroundImage: `url('${stageBackground}')` } : undefined}
        onClick={() => setIsOpen(true)}
        aria-label={copy.openLabel}
      >
        <img loading="lazy" className="character-display__main" src={character.mainCg} alt={copy.mainAlt} />
        {/* <img loading="lazy" className="character-display__portrait" src={expression} alt={state.expressionAlt} />
        {!isOpen && (
          <span className="character-display__prompt">{copy.openLabel}</span>
        )} */}
      </button>

      {isOpen && (
        <>
          <div className="dialog-choices" aria-label={copy.choiceLabel}>
            {choices.map((choice) => (
              <button key={`${stateId}-${choice.next}`} type="button" onClick={() => choose(choice.next)}>
                {choice.label}
              </button>
            ))}
          </div>
          <div className="dialog-controls" aria-label={copy.controlsLabel}>
            <button type="button" onClick={backToLastChoice} aria-label={copy.controls.back} disabled={history.length === 0}>
              <Undo2 size={18} />
            </button>
            <button type="button" onClick={() => setAutoPlay((current) => !current)} aria-label={copy.controls.auto}>
              {autoPlay ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button type="button" onClick={resetConversation} aria-label={copy.controls.reset}>
              <RotateCcw size={18} />
            </button>
            <button type="button" onClick={() => setInstant(true)} aria-label={copy.controls.skip}>
              <ChevronsRight size={18} />
            </button>
            <button type="button" onClick={skipToNextChoice} aria-label={copy.controls.next} disabled={choices.length === 0}>
              <StepForward size={18} />
            </button>
          </div>
          <div className="dialog-window">
            <div className="dialog-window__speaker">
              <span>{copy.speaker}</span>
              <strong>{state.title}</strong>
            </div>
            <p>
              <Typing
                instant={instant}
                renderText={(value) => <DefinitionText definitions={definitions}>{value}</DefinitionText>}
              >
                {state.response}
              </Typing>
            </p>
          </div>
        </>
      )}
    </article>
  )
}
