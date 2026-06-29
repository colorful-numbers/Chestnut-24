# Add Definitions

World definitions are parsed from markdown files in:

```text
data/definitions/
```

The folder is parallel to `data/sideStories/` because definitions are story content, not UI configuration.

## File Shape

Create one folder per term with a markdown file per language:

```text
data/definitions/<slug>/zh.md
data/definitions/<slug>/en.md
```

```markdown
---
aliases: ["Miracle", "alternate label"]
---
# 奇迹

The first paragraph becomes the short hover tooltip. Keep it compact and factual.

Longer notes can continue below. They appear on the `/defn` page as source content for later expansion.
```

## Parsing Rules

- The folder name becomes the stable slug, for example `miracle/` becomes `/defn#miracle`.
- Each language file is rendered in that language; a missing file falls back to `zh.md`.
- The first `#` heading becomes the displayed title.
- `aliases` are optional. Lookup is language-neutral: every alias plus each
  locale title resolves to the same definition, so `【奇迹】` and `【Miracle】`
  both link here.
- The first paragraph after the heading becomes the tooltip summary.
- Any other frontmatter keys are kept as extra metadata (`meta`).
- Only subfolders are parsed; `README.md` at the root of `data/definitions/` is ignored.

## Inline Links

Use bracket labels in rendered story copy:

```text
【奇迹】之后，人们进入【精灵回廊】。
```

If a matching title or alias exists, `components/DefinitionText.jsx` turns the label into a link with a hover tooltip. If no match exists, the text is left unchanged.

## Current Terms

The initial definition set covers:

- `【奇迹】`
- `【回廊】`
- `【冬眠】`
- `【忘却职业】`
- `【智能当量】`
- `【新宪法】`
