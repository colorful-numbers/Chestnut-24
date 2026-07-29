import AnimationContainer from './AnimationContainer'
import DefinitionMotionScene from './DefinitionMotionScene'
import SeamlessCorridor from './SeamlessCorridor'
import StoryGalleryScene from './StoryGalleryScene'

export default function LayeredArchiveTimeline({
  id,
  variant,
  title,
  items,
  moreLabel,
  moreHref,
  height,
}) {
  if (!items.length) return null

  return (
    <section id={id} className={`archive-timeline archive-timeline--${variant}`}>
      <SeamlessCorridor
        items={items}
        getItemLabel={(item) => item.title}
        selectLabel={title}
      >
        {({ item, index, controls, direction, previousItem, nextItem }) => (
          <AnimationContainer
            key={item.key}
            height={height}
            labelledBy={`${id}-title`}
          >
            {variant === 'stories' ? (
              <StoryGalleryScene
                item={item}
                index={index}
                title={title}
                headingId={`${id}-title`}
                moreLabel={moreLabel}
                moreHref={moreHref}
                previousItem={previousItem}
                nextItem={nextItem}
                controls={controls}
                direction={direction}
              />
            ) : (
              <DefinitionMotionScene
                item={item}
                title={title}
                headingId={`${id}-title`}
                moreLabel={moreLabel}
                moreHref={moreHref}
                controls={controls}
                direction={direction}
              />
            )}
          </AnimationContainer>
        )}
      </SeamlessCorridor>
    </section>
  )
}
