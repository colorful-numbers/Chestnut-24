# Add Characters And Dialogue

Character conversations are rendered by `components/CharacterDisplay.jsx`. On the
homepage they appear as preview cards in `components/CharacterCarousel.jsx`; the
full interactive dialogue lives on the standalone page `pages/cast/[id].js`,
where the display opens as a full-window modal.

A whole conversation is authored as **one markdown file per language**. The
markdown is parsed by `lib/characters.js` into the graph + text the widget
consumes; there is no per-character `index.js` or JSON anymore.

## Folder Layout

```text
data/characters/<id>/zh.md      (en.md optional)
public/characters/<id>/
```

Media is auto-discovered from the public folder by filename convention:

- `bg-<scene>.png` — scene backgrounds (`- [BG](bg-<scene>.png)`).
- `expression-<name>.<ext>` — dialogue sprites (`![x](expression-<name>.<ext>)`).
  The `defaultExpression` from frontmatter is shown until the first switch.
- `<id>-main-cg.png` — the still used everywhere outside the live dialogue stage
  (cast cards, carousel, previews). Cards never use the default expression.

## Global Settings

`data/characters/index.js` holds everything shared across characters: the BGM
track table (referenced by name from markdown), the per-locale display names for
those tracks, and the UI chrome strings (control tooltips, music panel, backlog
labels). It exports `getCharacters()`, which the pages call in `getStaticProps`.

To add a BGM track, add it to the `BGM` map there and give it a display name in
`TRACK_NAMES`; reference it in markdown as `- [BGM](<name>)`.

## Markdown Format

```md
---
"title": "角色名"
"speaker": "角色名"
"defaultExpression": "expression-neutral.svg"
"defaultBGM": "main"
"starterNode": "wake"
"defaultNode": "tailing"
---

# 角色名

Text right under the H1 is the short character blurb (cast card / meta).

## 场景名

- [BG](bg-scene.png)
- [BGM](main)

### wake

![expression](expression-uncertain.png)

第一句。每个非空行是单独显示的一句对话。

第二句。

![expression](expression-neutral.svg)

第三句，从这一行开始换表情。

- [SKIP](#look)

### look

提示文本。

- [看向白色长刀](#blade) 0.5
- [确认信号塔](#tower) 0.5
```

### Rules

- **Frontmatter** — `title`, `speaker`, `defaultExpression`, `defaultBGM`,
  `starterNode`, `defaultNode`. `defaultNode` must always be defined; it is the
  fallback target for skips and dead-ends. Node names are matched
  case-insensitively (`#intro` == `Intro`).
- **`# H1`** — the character title; the paragraph(s) under it are the `body`
  blurb.
- **`## H2`** — a scene. `- [BG](file)` sets its background (a file in the
  character folder, or an absolute `/path`); `- [BGM](name)` sets its track. Every
  node under the heading shares the scene background.
- **`### H3`** — a dialogue node (id = heading text). Each non-empty line is one
  displayed sentence; the window shows them one at a time.
- **`![x](expression.png)`** — switches the sprite for the following lines.
- **`![x](EMPTY)`** — hides the sprite entirely (renders nothing) until the next
  expression switch.
- **`- [BGM](name)`** mid-node — changes the running track from here on. It
  persists; it is not reset on node or scene change.
- **Choices** at the end of a node:
  - `- [Label](#node) 0.3` — a weighted choice. Weight defaults to `1` if
    omitted; weights need not sum to 1 (they are normalized by weighted sum).
  - A node may list more than three choices; the display samples **three** by
    weight. With three or fewer, all are shown.
  - `- [SKIP](#node)` — jump straight to a node with no button. If a SKIP lands
    in the sampled buffer of three, it fires immediately. A node whose only
    choice is a SKIP is a plain transition.
  - A node with **no** choices falls through to `defaultNode`. A choice pointing
    at a node that does not exist is treated as `- [SKIP](#defaultNode)`.

The widget keeps a per-sentence history stack, so the backlog panel and the
"back to last choice / sentence" controls can return to any visited line.

## Localization

Author `zh.md` fully. `en.md` is optional and, because node ids are the
(localized) headings, each language file is self-contained — keep the headings,
choice targets, and media references consistent between languages. A missing
`en.md` falls back to `zh.md`.
