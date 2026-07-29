import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import AnimatedText from './AnimatedText'

export default function DefinitionMotionScene({
  item,
  title,
  headingId,
  moreLabel,
  moreHref,
  controls,
  direction,
}) {
  return (
    <article
      className="definition-motion"
      data-direction={direction > 0 ? 'forward' : 'backward'}
    >
      <div className="definition-motion__media" aria-hidden="true">
        <img className="definition-motion__layer definition-motion__layer--far" src={item.media} alt="" />
        <img className="definition-motion__layer definition-motion__layer--mid" src={item.media} alt="" />
        <img className="definition-motion__layer definition-motion__layer--near" src={item.media} alt="" />
      </div>

      <header className="archive-timeline__heading">
        <AnimatedText as="h2" id={headingId} start={0.01}>{title}</AnimatedText>
      </header>

      <Link className="definition-motion__copy" href={item.href}>
        <AnimatedText as="h3" start={0.09} step={0.004}>{item.title}</AnimatedText>
        {item.hook && (
          <AnimatedText as="p" start={0.42} step={0.0025}>{item.hook}</AnimatedText>
        )}
        <ArrowUpRight aria-hidden="true" />
      </Link>

      {moreLabel && (
        <Link className="archive-timeline__more" href={moreHref}>
          <AnimatedText start={0.74} step={0.004}>{moreLabel}</AnimatedText>
          <ArrowUpRight aria-hidden="true" />
        </Link>
      )}

      {controls}
      <div className="definition-motion__arrival" aria-hidden="true" />
    </article>
  )
}
