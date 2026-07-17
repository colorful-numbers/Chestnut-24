import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CircleDot, Map } from 'lucide-react'
import DefinitionText from './DefinitionText'

export default function CharacterGateway({ copy, locale, characters, definitions = [] }) {
  const [activeId, setActiveId] = useState(characters[0]?.id || '')
  const activeCharacter = useMemo(
    () => characters.find((character) => character.id === activeId) || characters[0],
    [activeId, characters],
  )

  if (!activeCharacter) return null

  const characterCopy = activeCharacter.locales?.[locale]
    || activeCharacter.locales?.zh
    || activeCharacter.zh
  const profile = copy.profiles?.[activeCharacter.id] || {}

  return (
    <section id="cast-entry" className="character-gateway" aria-labelledby="character-gateway-title">
      <div className="game-section-heading">
        <div>
          <span>{copy.label}</span>
          <h2 id="character-gateway-title">{copy.title}</h2>
        </div>
        <p>{copy.body}</p>
      </div>

      <div className="character-gateway__stage">
        <div className="character-gateway__tabs" role="tablist" aria-label={copy.selectLabel}>
          {characters.map((character, index) => {
            const itemCopy = character.locales?.[locale] || character.locales?.zh || character.zh
            const isActive = character.id === activeCharacter.id
            return (
              <button
                key={character.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={isActive ? 'is-active' : ''}
                onClick={() => setActiveId(character.id)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{itemCopy.title}</strong>
                <small>{copy.viewpoint}</small>
              </button>
            )
          })}
        </div>

        <div className="character-gateway__media" role="tabpanel">
          <img
            key={activeCharacter.id}
            src={activeCharacter.mainCg}
            alt={characterCopy.mainAlt || characterCopy.title}
            draggable="false"
          />
          <span className="character-gateway__scan" aria-hidden="true" />
          <div className="character-gateway__coordinate" aria-hidden="true">
            <CircleDot size={13} />
            {profile.coordinate || 'ARCHIVE / ACTIVE'}
          </div>
        </div>

        <div className="character-gateway__brief">
          <span>{profile.eyebrow || characterCopy.label}</span>
          <h3>{characterCopy.title}</h3>
          <p className="character-gateway__summary">
            <DefinitionText definitions={definitions}>{characterCopy.body}</DefinitionText>
          </p>

          <div className="character-gateway__question">
            <span>{copy.questionLabel}</span>
            <strong>{profile.question}</strong>
          </div>

          <div className="character-gateway__terms" aria-label={copy.relatedLabel}>
            <Map size={16} />
            {(profile.terms || []).map((term) => (
              <Link key={term.slug} href={`/defn#${term.slug}`}>{term.label}</Link>
            ))}
          </div>

          <Link className="game-primary-action" href={`/cast/${activeCharacter.id}`}>
            <span>
              <small>{copy.enterHint}</small>
              {copy.enter}
            </span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}
