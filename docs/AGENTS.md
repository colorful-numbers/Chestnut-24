# Chestnut-24 Agent Notes

This project inherits the canonical agent rules from the root `AGENTS.md` submodule.

## Project Summary

Chestnut-24 is an independent Next.js interactive visual fictional novel with preserved utility routes.

The homepage should be treated as a visual novel surface first:

1. Present a concise prologue.
2. Explain the post-Miracle world, the Sylph Corridor, hibernation, the forgetting profession, Qi, and Work 101.
3. Show randomly selected side-story fragments from `data/sideStories/`, at most five per refresh.
4. Keep tools, dev notes, and invented unrelated plot hooks out of the public homepage.

## Product Rules

- Keep the main navigation simple and internal.
- Keep external links out of the primary UI unless explicitly requested.
- Maintain bilingual homepage content through `data/siteContent.js`.
- Do not render workflow notes, build notes, progress summaries, or utility catalog copy as homepage content.
- Do not invent unrelated story fragments such as one-off locations, incidents, or characters that are not connected to the provided world outline.
- Put publishable side-story fragments in `data/sideStories/` and media assets in `public/story-media/`.
- Put reusable world definitions in `data/definitions/`; the `/defn` page and inline hover links are generated from these markdown files.
- Use `【term】` labels in story copy when a local definition should be linked.
- Use `components/StoryCarousel.jsx` for front-page fragments; cards should occupy 80% of the horizontal carousel space.
- Keep the carousel cyclic, drag-enabled, and dot-indexed. Carousel cards are links; the shared `Carousel` only captures the pointer once a real drag starts so a tap still navigates. Do not call `setPointerCapture` on pointer-down.
- The Fragments and Cast nav entries are standalone pages (`/fragments`, `/cast`) rendered as card-list grids; each card links to a detail page. Side-story cards open a blog-style post at `/fragments/[id]`; character cards open the dialogue page at `/cast/[id]`.
- Character data is split into a language-neutral `graph` (node `expression` / `background` / `bgm`, plus `next` for sentence nodes or `choices` for decision nodes) and per-locale `lines` (title, text, and choice labels). Keep most nodes as continue-only sentence nodes; decision nodes must offer two or more choices. Author the graph once; localize only the text.
- Use `components/CharacterDisplay.jsx` for the game-dialog character experience. On `/cast/[id]` it opens as a full-window modal (everything except the navbar) with the back button embedded in the upper-left of the stage. Keep the six tooltip controls (back to last choice, back to last sentence, backlog, auto play, next sentence, next choice). Auto play and the "next" controls advance sentence nodes only and pause on decision/end nodes.
- Use `components/BgmPlayer.jsx` for background music (corner circle that expands to a panel holding an Apple Music embed with its own controls). BGM `bgm.src` values are Apple Music embed URLs; the iframe stays mounted while collapsed so playback continues. Cross-origin embeds only play once deployed to a real domain — they will not play on localhost, which is acceptable. Scene changes switch `background` and `bgm` from the active node, with a crossfade on the background image.
- Localization policy: author Chinese (`zh`) fully; use placeholders for English (`en`) until a translation pass is explicitly requested. The maintainer previews the Chinese site only.
- Keep the primary visual theme monochrome: black, white, gray, and low-saturation accents only. Titles in heroes and cards use the top-to-bottom `titleFadeDown` reveal.
- Preserve existing utility routes under `pages/utils/*`, but do not use them as the homepage focus.
- Record meaningful implementation progress in `docs/PROGRESS.md`.
- Do not modify the root `AGENTS.md` submodule; project rules live here in `docs/AGENTS.md`.

## Editing Map

- Homepage: `pages/index.js`
- Navbar: `pages/navbar.js`
- Footer: `pages/footer.js`
- Bilingual content: `data/siteContent.js`
- Side-story fragments: `data/sideStories/<id>/{zh,en}.md`
- Side-story parser: `lib/sideStories.js`
- Definition markdown: `data/definitions/<slug>/{zh,en}.md`
- Definition parser: `lib/definitions.js`
- Shared markdown/frontmatter helpers: `lib/markdown.js`
- Inline definition tooltip/link component: `components/DefinitionText.jsx`
- Definition page: `pages/defn.js`
- Character dialogue: `data/characters/<id>/{zh,en}.md` (one markdown file per language)
- Character markdown parser: `lib/characters.js`
- Character global settings + loader (BGM, chrome, `getCharacters()`): `data/characters/index.js`
- Character dialogue component: `components/CharacterDisplay.jsx`
- Background music component: `components/BgmPlayer.jsx` (Apple Music embeds; track URLs live in the character `bgm` data)
- Fragments pages: `pages/fragments/index.js`, `pages/fragments/[id].js`
- Cast pages: `pages/cast/index.js`, `pages/cast/[id].js`
- Story media placeholders: `public/story-media/*`
- Character media placeholders: `public/characters/*` (e.g. `public/characters/artifact101/`)
- i18n hook: `lib/i18n.js`
- Site styling: `styles/world-archive.css`
- Utility archive component: `components/ToolArchive.jsx`

## Local Build

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Run `npm run dev` for local development.
4. Run `npm run build` before review or release.

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

## Review Flow

At the end of each modification round:

1. Run the relevant validation command.
2. Smoke-test `/`, `/defn`, `/utils`, and `/settings`.
3. Check that visible external links and dev/process notes have not been reintroduced into the homepage.
4. Update `docs/PROGRESS.md` with a brief entry.
