import LayeredArchiveTimeline from './LayeredArchiveTimeline'

export default function StoryCarousel({ title, locale, stories, hooks = {}, maxItems = 5, moreLabel, moreHref = '/fragments' }) {
  const items = stories.slice(0, maxItems).map((story) => {
    const storyCopy = story[locale] || story.zh
    return {
      key: story.id,
      href: `/fragments/${story.id}`,
      title: storyCopy.title,
      hook: hooks[story.id],
      media: story.media,
    }
  })

  return (
    <LayeredArchiveTimeline
      id="notice"
      variant="stories"
      title={title}
      items={items}
      moreLabel={moreLabel}
      moreHref={moreHref}
      height={300}
    />
  )
}
