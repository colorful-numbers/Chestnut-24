# Characters

Each character uses one markdown chapter folder per language plus a media
folder. The original one-file layout remains supported for existing characters.

```text
data/characters/<id>/zh/index.md
data/characters/<id>/zh/<chapter>.md
data/characters/<id>/en/index.md      (optional)
public/characters/<id>/
```

Each markdown file carries one chapter's scenes, dialogue, expression and BGM
switches, and weighted choices. Use `#node` for a node in the current chapter
and `./chapter.md/#node` to route into another chapter. Global settings (the BGM
track table, the shared UI chrome strings, and the loader) live in
[`data/characters/index.js`](./index.js), which exports `getCharacters()` for the
pages to call in `getStaticProps`.

Media is auto-discovered from `public/characters/<id>/`:

- `bg-<scene>.png` — scene backgrounds, referenced by `- [BG](bg-<scene>.png)`.
- `expression-<name>.<ext>` — dialogue sprites, referenced by `![x](expression-<name>.<ext>)`.
- `<id>-main-cg.png` — the still used on cast cards and previews (not the default expression).

See [docs/content/characters.md](../../docs/content/characters.md) for the full
markdown format. `artifact101/zh/` is the chapter-based reference; `qi/zh.md`
shows the compatible legacy format.
