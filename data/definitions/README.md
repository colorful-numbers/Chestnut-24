# Definitions

Each definition is a folder in this directory holding one markdown file per
language. They are parsed into the `/defn` page and the inline definition
tooltips, and rendered in the visitor's current language.

```text
data/definitions/
  miracle/
    zh.md
    en.md
```

Each language file uses this structure:

```md
---
aliases: ["Miracle"]
---
# Term Title

First paragraph. This paragraph becomes the short tooltip description.

Longer explanation can follow.
```

- The `#` heading is the localized title.
- The first paragraph becomes the tooltip summary.
- `aliases` in frontmatter list the labels that resolve to this term. Lookup is
  language-neutral: every alias plus each locale's title is matched, so both
  `【奇迹】` and `【Miracle】` link to the same definition.
- Any other frontmatter keys are kept as extra metadata (`meta`).

If a language file is missing the loader falls back to the Chinese file.
