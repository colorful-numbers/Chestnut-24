import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import AnimatedText from './AnimatedText'

const ART = {
  artifact101: {
    theme: 'tide',
    far: '/animation/cast/artifact101/bus-stop-far.png',
    mid: '/animation/cast/artifact101/bus-stop-mid.png',
    character: '/characters/artifact101/expression-neutral.png',
    near: '/animation/cast/artifact101/gulls-near.png',
  },
  qi: {
    theme: 'tower',
    far: '/characters/qi/bg-tower.png',
    character: '/characters/qi/expression-neutral.png',
    mid: '/characters/qi/expression-neutral.png',
    near: '/characters/qi/bg-blade.png',
  },
}

function CorridorField() {
  return (
    <div className="corridor-field" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <i key={index} style={{ '--corridor-index': index }} />
      ))}
    </div>
  )
}

export default function CharacterAnimationScene({
  character,
  characterCopy,
  copy,
  controls,
}) {
  const art = ART[character.id] || {
    theme: 'fallback',
    far: character.mainCg,
    mid: characterCopy.defaultExpressionSrc || character.mainCg,
    near: character.mainCg,
  }
  const hook = copy.hooks?.[character.id]

  return (
    <article className={`cast-scene cast-scene--${art.theme}`}>
      <div className="cast-scene__wash" aria-hidden="true" />
      <CorridorField />

      <div className="cast-scene__art" aria-hidden="true">
        <img className="cast-scene__layer cast-scene__layer--far" src={art.far} alt="" />
        <img className="cast-scene__layer cast-scene__layer--origin" src={art.character} alt="" />
        <img className="cast-scene__layer cast-scene__layer--mid" src={art.mid} alt="" />
        <img className="cast-scene__layer cast-scene__layer--near" src={art.near} alt="" />
      </div>

      <div className="cast-scene__copy">
        <AnimatedText
          as="p"
          className="cast-scene__section-title"
          start={0.02}
        >
          {copy.title}
        </AnimatedText>
        <AnimatedText
          as="h2"
          className="cast-scene__title"
          start={0.08}
        >
          {characterCopy.title}
        </AnimatedText>
        {hook && (
          <AnimatedText
            as="p"
            className="cast-scene__hook"
            start={0.46}
          >
            {hook}
          </AnimatedText>
        )}
        <Link className="cast-scene__enter" href={`/cast/${character.id}`}>
          <AnimatedText start={0.72}>{copy.enter}</AnimatedText>
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>

      {controls}
      <div className="cast-scene__whiteout" aria-hidden="true" />
    </article>
  )
}
