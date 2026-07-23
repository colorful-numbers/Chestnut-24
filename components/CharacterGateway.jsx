import AnimationContainer from './AnimationContainer'
import CharacterAnimationScene from './CharacterAnimationScene'
import SeamlessCorridor from './SeamlessCorridor'

export default function CharacterGateway({ copy, locale, characters }) {
  const featuredCharacters = ['artifact101', 'qi']
    .map((id) => characters.find((character) => character.id === id))
    .filter(Boolean)

  if (!featuredCharacters.length) return null

  return (
    <section id="cast-entry" className="character-corridor">
      <SeamlessCorridor
        items={featuredCharacters}
        getItemLabel={(item) => {
          const itemCopy = item.locales?.[locale] || item.locales?.zh || item.zh
          return itemCopy.title
        }}
        selectLabel={copy.selectLabel}
      >
        {({ item, controls }) => {
          const characterCopy = item.locales?.[locale] || item.locales?.zh || item.zh
          return (
            <AnimationContainer
              key={item.id}
              className={`animation-container--${item.id}`}
              height={380}
            >
              <CharacterAnimationScene
                character={item}
                characterCopy={characterCopy}
                copy={copy}
                controls={controls}
              />
            </AnimationContainer>
          )
        }}
      </SeamlessCorridor>
    </section>
  )
}
