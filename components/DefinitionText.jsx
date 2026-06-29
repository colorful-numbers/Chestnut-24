import { useI18n } from '../lib/i18n'

export default function DefinitionText({ children, definitions = [] }) {
  const { locale } = useI18n()
  if (typeof children !== 'string') return children

  const lookup = definitions.reduce((current, definition) => {
    ;(definition.aliases || []).forEach((alias) => {
      current[alias] = definition
    })
    return current
  }, {})
  const parts = children.split(/(【[^】]+】)/g)

  return parts.map((part, index) => {
    const match = part.match(/^【([^】]+)】$/)
    if (!match) return part

    const label = match[1]
    const definition = lookup[label]
    if (!definition) return part

    const copy = definition[locale] || definition.zh

    return (
      <a
        key={`${label}-${index}`}
        href={`/defn#${definition.slug}`}
        className="definition-term"
      >
        {part}
        <span className="definition-tooltip" role="tooltip">
          <strong>{copy.title}</strong>
          <span>{copy.summary}</span>
        </span>
      </a>
    )
  })
}
