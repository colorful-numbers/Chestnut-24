# Add Side Stories

Side-story fragments are rendered by `components/StoryCarousel.jsx`.

## Data Location

Add fragments in:

```text
data/sideStories/index.js
```

Add media in:

```text
public/story-media/
```

## Fragment Shape

```js
{
  id: 'unique-story-id',
  time: '2283.06.05 dusk',
  media: '/story-media/my-art.svg',
  zh: {
    kicker: '器',
    title: '白色的刀',
    body: '中文片段正文。',
  },
  en: {
    kicker: 'Qi',
    title: 'The White Blade',
    body: 'English fragment body.',
  },
}
```

## Homepage Behavior

On each refresh, the homepage randomly selects at most five fragments. Each card occupies 80% of the carousel viewport and shows its text in the lower-left corner.

## Definition Links

When a fragment references a shared world term, wrap it with full-width brackets:

```text
【奇迹】之后，城市仍然保留着给苏醒者使用的补给点。
```

If a matching markdown file exists in `data/definitions/`, the homepage renders the term as a hover definition link.
