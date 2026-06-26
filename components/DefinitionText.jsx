export default function DefinitionText({ children, definitions = [] }) {
  if (typeof children !== 'string') return children

  const lookup = definitions.reduce((current, definition) => {
    current[definition.title] = definition
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

    return (
      <a
        key={`${label}-${index}`}
        href={`/defn#${definition.slug}`}
        className="definition-term"
      >
        {part}
        <span className="definition-tooltip" role="tooltip">
          <strong>{definition.title}</strong>
          <span>{definition.summary}</span>
        </span>
      </a>
    )
  })
}
