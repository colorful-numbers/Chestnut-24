# Side Stories

Each side-story fragment is a folder in this directory holding one markdown file
per language. They feed the front-page random carousel and the `/fragments`
pages, rendered in the visitor's current language.

```text
data/sideStories/
  white-blade/
    zh.md
    en.md
```

Each language file uses this structure:

```md
---
order: 5
time: 2283.06.05 dusk
media: /story-media/fragment-blade.png
kicker: Qi
---
# The White Blade

First paragraph becomes the card summary.

Further paragraphs become the full article body on the fragment page.
```

Frontmatter:

- `order`: sort order in the fragments list (lower first).
- `time`: in-world time shown on the card. Shared metadata; read from either
  language file.
- `media`: image path under `public/story-media/`.
- `kicker`: short localized label shown above the title.

Body:

- The `#` heading is the localized title.
- The first paragraph is the card summary (`body`); all paragraphs together form
  the article shown on the fragment page.

If a language file is missing the loader falls back to the Chinese file. The
homepage randomly selects at most five fragments on each refresh.
