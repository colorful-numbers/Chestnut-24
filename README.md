# Chestnut-24

Independent information site with preserved utility pages.

## Current Direction

Chestnut-24 is an info-first site. The homepage is for:

- high-level project information
- notices and update records
- lightweight visual demos
- a direct utility vending machine

Utilities are not part of the worldbuilding narrative. They remain standalone tools under `pages/utils/*` and are linked from the homepage as functional slots.

## Internationalization

Homepage copy is bilingual.

- Content source: `data/siteContent.js`
- Runtime hook: `lib/i18n.js`
- Locale storage key: `chestnut-locale`
- Supported locales: `zh`, `en`

Add new homepage text by updating both locale objects in `siteContent.js`.

## Utilities

The utility routes are preserved. The homepage links to them through the tool vending machine, and `/utils` remains the full utility index.

## Progress Log

Progress and conversation summaries are recorded in `docs/PROGRESS.md`.

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
