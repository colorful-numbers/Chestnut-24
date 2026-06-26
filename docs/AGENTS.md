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
- Keep the carousel cyclic, drag-enabled, and dot-indexed.
- Use `components/CharacterDisplay.jsx` for game-dialog-style character widgets, with character data under `data/characters/<character>/` and media under `public/characters/<character>/`.
- Keep the primary visual theme monochrome: black, white, gray, and low-saturation accents only.
- Preserve existing utility routes under `pages/utils/*`, but do not use them as the homepage focus.
- Record meaningful implementation progress in `docs/PROGRESS.md`.

## Editing Map

- Homepage: `pages/index.js`
- Navbar: `pages/navbar.js`
- Footer: `pages/footer.js`
- Bilingual content: `data/siteContent.js`
- Side-story fragments: `data/sideStories/index.js`
- Definition markdown: `data/definitions/*.md`
- Definition parser: `lib/definitions.js`
- Inline definition tooltip/link component: `components/DefinitionText.jsx`
- Definition page: `pages/defn.js`
- Character display data: `data/characters/*/index.js`
- Story media placeholders: `public/story-media/*`
- Character media placeholders: `public/characters/*`
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
