import LayeredArchiveTimeline from './LayeredArchiveTimeline'

const MEDIA_BY_SLUG = {
  miracle: '/story-media/fragment-compute.png',
  'sylph-corridor': '/story-media/fragment-ballons.png',
  hibernation: '/story-media/fragment-awake.png',
  forgetting: '/story-media/fragment-street.png',
}

const FEATURED_SLUGS = ['miracle', 'sylph-corridor', 'hibernation', 'forgetting']

export default function WorldIndex({ copy, locale, definitions }) {
  const featured = FEATURED_SLUGS
    .map((slug) => definitions.find((definition) => definition.slug === slug))
    .filter(Boolean)
  const items = featured.map((definition) => {
    const definitionCopy = definition[locale] || definition.zh
    return {
      key: definition.slug,
      href: `/defn#${definition.slug}`,
      title: definitionCopy.title,
      hook: copy.hooks?.[definition.slug],
      media: MEDIA_BY_SLUG[definition.slug],
    }
  })

  return (
    <LayeredArchiveTimeline
      id="world-index"
      variant="definitions"
      title={copy.title}
      items={items}
      moreLabel={copy.more || copy.title}
      moreHref="/defn"
      height={300}
    />
  )
}
