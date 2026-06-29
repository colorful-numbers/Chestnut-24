# Add Side Stories

Side-story fragments are rendered by `components/StoryCarousel.jsx`.

## Data Location

Each fragment is a folder with one markdown file per language:

```text
data/sideStories/<id>/zh.md
data/sideStories/<id>/en.md
```

Add media in:

```text
public/story-media/
```

## Fragment Shape

Shared metadata (`order`, `time`, `media`) and the localized `kicker` live in
frontmatter; the `#` heading is the title and the paragraphs are the body.

```md
---
order: 5
time: 2283.06.05 dusk
media: /story-media/my-art.svg
kicker: 器
---
# 白色的刀

第一段会成为卡片摘要。

后续段落会成为碎片详情页的正文。
```

The loader (`lib/sideStories.js`) reads these into the object shape the carousel
and fragment pages already consume (`{ id, time, media, zh, en }`). A missing
language file falls back to `zh.md`.

## Homepage Behavior

On each refresh, the homepage randomly selects at most five fragments. Each card occupies 80% of the carousel viewport and shows its text in the lower-left corner.

## Definition Links

When a fragment references a shared world term, wrap it with full-width brackets:

```text
【奇迹】之后，城市仍然保留着给苏醒者使用的补给点。
```

If a matching definition exists in `data/definitions/`, the homepage renders the term as a hover definition link.
