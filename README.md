# 栗世界 / Set of Chestnut

栗世界 is a bilingual interactive visual fictional novel about the post-Miracle world: the Sylph Corridor, stratospheric balloon infrastructure, hibernation, forgetting as a profession, and the people who remain awake inside an abundant but quiet age.

The site goal is not to be an information hub or utility portal. The front page should feel like the opening surface of a visual novel: world premise, random fragments, character cards, and media-forward scenes that can later be expanded into side stories.

## Homepage Goals

- Present the core world setting for the post-Miracle era.
- Show up to five randomly selected side-story fragments on each refresh through `components/StoryCarousel.jsx`.
- Use card-like visual fragments that occupy 80% of the horizontal carousel space, with media backgrounds and lower-left text.
- Reserve character cards for generated media, portraits, and scene art.
- Use `components/CharacterDisplay.jsx` for game-dialog-style character interactions.
- Keep utility routes available but separate from the main story experience.

## Side Stories

Side-story fragments live in `data/sideStories/`.

- Add or edit fragments in `data/sideStories/index.js`.
- Put artwork or placeholder media under `public/story-media/`.
- Each fragment should include `time`, `media`, and `zh` / `en` copy so the language toggle can switch the whole homepage.
- The homepage randomly selects at most five fragments from this folder on refresh.
- Terms written as `【term】` are linked automatically when a matching definition exists in `data/definitions/`.

## Definitions

Definition files live in `data/definitions/`, parallel to `data/sideStories/`.

- Add one markdown file per term.
- Use the first `#` heading as the displayed term.
- Use `aliases` frontmatter for English labels or alternate spellings.
- The first paragraph becomes the hover tooltip text.
- The `/defn` page lists every parsed definition.
- `components/DefinitionText.jsx` turns labeled terms such as `【奇迹】` and `【精灵回廊】` into links with local hover summaries.

## Character Displays

Interactive character demos live under `data/characters/<character>/`, with media under `public/characters/<character>/`.

The current demo is `data/characters/qi/index.js`, bound to `public/characters/qi/`. It includes main CG, expression images, intro cards, predefined conversation choices, and predefined answers.

## Documentation

The `docs/` directory is intended to be published as a GitHub Pages documentation site.

- Docs entry: `docs/index.md`
- Add side stories: `docs/content/side-stories.md`
- Add characters and dialogue: `docs/content/characters.md`
- Add definitions: `docs/content/definitions.md`
- Current version: `v0.1.4`

## Internationalization

Homepage frame copy is bilingual.

- Site copy: `data/siteContent.js`
- Side-story fragments: `data/sideStories/index.js`
- Runtime hook/provider: `lib/i18n.js`
- Locale storage key: `chestnut-locale`
- Supported locales: `zh`, `en`

## Utilities

Utility routes remain under `pages/utils/*` for compatibility, but they are not embedded in the visual novel homepage.

## Agent Notes

Canonical agent guidance is supplied by the root `AGENTS.md` submodule. Chestnut-24-specific rules live in `docs/AGENTS.md`, and the round-end checklist lives in `docs/LLM_CHECK.md`.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```
