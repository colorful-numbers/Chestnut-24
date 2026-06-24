# CODEX Workflow

## Project Summary

Chestnut-24 is an independent Next.js information site with a preserved utility area.

The homepage should be treated as an information product first:

1. Present a concise overview.
2. Surface notices and update status.
3. Keep demos lightweight and visual.
4. Present utilities as standalone tool slots, not as lore.

## Important Product Rules

- Keep the main navigation simple and internal.
- Keep external links out of the primary UI unless explicitly requested.
- Maintain bilingual homepage content through `data/siteContent.js`.
- Do not put deep story, character, or lore archive content on the homepage by default.
- Preserve existing utility routes under `pages/utils/*`.
- Record meaningful implementation progress in `docs/PROGRESS.md`.

## Editing Map

- Homepage: `pages/index.js`
- Navbar: `pages/navbar.js`
- Footer: `pages/footer.js`
- Bilingual content: `data/siteContent.js`
- i18n hook: `lib/i18n.js`
- Site styling: `styles/world-archive.css`
- Utility vending machine: `components/ToolArchive.jsx`

## Local Build

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Run `npm run dev` for local development.
4. Run `npm run build` before review or release.

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`.

## Review Flow

At the end of each modification round:

1. Run the relevant validation command.
2. Smoke-test `/`, `/utils`, and `/settings`.
3. Check that visible external links have not been reintroduced unintentionally.
4. Update `docs/PROGRESS.md` with a brief entry.
