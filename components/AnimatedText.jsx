const segmentText = (text) => {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)]
      .map(({ segment }) => segment)
  }
  return Array.from(text)
}

export default function AnimatedText({
  as: Tag = 'span',
  children,
  className = '',
  start = 0,
  step = 0.006,
  ...rest
}) {
  const text = String(children ?? '')
  const characters = segmentText(text)

  return (
    <Tag
      {...rest}
      className={`animated-text ${className}`.trim()}
      style={{
        '--text-start': start,
        '--character-step': step,
      }}
      aria-label={text}
    >
      {characters.map((character, index) => (
        <span
          key={`${character}-${index}`}
          className="animated-text__character"
          style={{ '--character-index': index }}
          aria-hidden="true"
        >
          {character === ' ' ? '\u00A0' : character}
        </span>
      ))}
    </Tag>
  )
}
