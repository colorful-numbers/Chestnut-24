# Project Overview

栗世界 / chestnut set is a bilingual interactive visual fictional novel about the post-Miracle world, the Sylph Corridor, hibernation, forgetting as a profession, and people who remain awake inside an abundant but quiet age.

The public homepage should prioritize:

- full-bleed visual atmosphere
- random side-story fragments
- character dialogue widgets
- bilingual presentation
- media placeholders that can later be replaced with generated art

Utilities remain available under `pages/utils/*`, but they are not part of the primary homepage experience.

## Runtime Shape

- Framework: Next.js pages router
- Styling: Tailwind base plus `styles/world-archive.css`
- Locale state: `lib/i18n.js`
- Side stories: `data/sideStories/`
- Definitions: `data/definitions/`
- Characters: `data/characters/`
- Media: `public/story-media/` and `public/characters/`

## Definition Surface

The `/defn` route lists world-setting terms parsed from markdown. Inline labels written as `【term】` are linked by `components/DefinitionText.jsx` when the term exists in `data/definitions/`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```
