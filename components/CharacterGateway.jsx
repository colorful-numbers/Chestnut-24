import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CharacterGateway({ copy, locale, characters }) {
  const [activeId, setActiveId] = useState(characters[0]?.id || '')
  const activeCharacter = useMemo(
    () => characters.find((character) => character.id === activeId) || characters[0],
    [activeId, characters],
  )

  if (!activeCharacter) return null

  const characterCopy = activeCharacter.locales?.[locale]
    || activeCharacter.locales?.zh
    || activeCharacter.zh
  return (
    <section id="cast-entry" className="character-gateway" aria-labelledby="character-gateway-title">
      <div className="game-section-heading">
        <div>
          <h2 id="character-gateway-title">{copy.title}</h2>
        </div>
      </div>

      <div className="character-gateway__stage">
        <div className="character-gateway__tabs" role="tablist" aria-label={copy.selectLabel}>
          {characters.map((character) => {
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
                <strong>{itemCopy.title}</strong>
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
        </div>

        <div className="character-gateway__brief">
          <h3>{characterCopy.title}</h3>
          {copy.hooks?.[activeCharacter.id] && (
            <p key={`${activeCharacter.id}-hook`} className="character-gateway__summary card-hook">
              {copy.hooks[activeCharacter.id]}
            </p>
          )}
          <Link className="game-primary-action" href={`/cast/${activeCharacter.id}`}>
            <span>{copy.enter}</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}
