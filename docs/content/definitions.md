# Add Definitions

World definitions are parsed from markdown files in:

```text
data/definitions/
```

The folder is parallel to `data/sideStories/` because definitions are story content, not UI configuration.

## File Shape

Create one markdown file per term:

```markdown
---
aliases: ["Miracle", "alternate label"]
---
# 奇迹

The first paragraph becomes the short hover tooltip. Keep it compact and factual.

Longer notes can continue below. They appear on the `/defn` page as source content for later expansion.
```

## Parsing Rules

- The filename becomes the stable slug, for example `miracle.md` becomes `/defn#miracle`.
- The first `#` heading becomes the displayed title.
- `aliases` are optional and let English text or alternate names link to the same definition.
- The first paragraph after the heading becomes the tooltip summary.
- `README.md` inside `data/definitions/` is ignored by the parser.

## Inline Links

Use bracket labels in rendered story copy:

```text
【奇迹】之后，人们进入【精灵回廊】。
```

If a matching title or alias exists, `components/DefinitionText.jsx` turns the label into a link with a hover tooltip. If no match exists, the text is left unchanged.

## Current Terms

The initial definition set covers:

- `【奇迹】`
- `【精灵回廊】`
- `【冬眠】`
- `【忘却职业】`
- `【智能当量】`
- `【新宪法】`
