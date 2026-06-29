# Characters

Each character is one markdown file per language plus a media folder.

```text
data/characters/<id>/zh.md      (en.md optional)
public/characters/<id>/
```

The markdown carries the whole conversation — scenes, dialogue, expression and
bgm switches, and weighted choices. Global settings (the BGM track table, the
shared UI chrome strings, and the loader) live in
[`data/characters/index.js`](./index.js), which exports `getCharacters()` for the
pages to call in `getStaticProps`.

Media is auto-discovered from `public/characters/<id>/`:

- `bg-<scene>.png` — scene backgrounds, referenced by `- [BG](bg-<scene>.png)`.
- `expression-<name>.<ext>` — dialogue sprites, referenced by `![x](expression-<name>.<ext>)`.
- `<id>-main-cg.png` — the still used on cast cards and previews (not the default expression).

See [docs/content/characters.md](../../docs/content/characters.md) for the full
markdown format. `qi/zh.md` is the reference example.
