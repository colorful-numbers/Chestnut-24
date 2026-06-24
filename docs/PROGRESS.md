# Progress Log

## 2026-06-24

### Conversation Summary

Initial request: redesign the existing personal homepage and utility site into an interactive science-fiction archive while preserving utility routes.

Work completed in that round:

- Restored the local project source into the empty workspace.
- Preserved existing utility routes under `pages/utils/*`.
- Built an interactive archive-style homepage.
- Added editable content data and archive components.
- Verified the static build and key routes.

Follow-up request: add i18n support, simplify the navigation, make the site an information site first and utilities second, treat utilities like a tool vending machine, hide lore-related homepage components, remove external links from the simplified UI, and record progress inside the repo.

Work completed in this round:

- Added bilingual content structure in `data/siteContent.js`.
- Added lightweight locale state in `lib/i18n.js`.
- Rebuilt the homepage as an info-first landing page with overview, notice, information modules, and a tool vending machine.
- Simplified the navbar to internal links only.
- Added Chinese/English language switching.
- Removed story/lore-heavy sections from the rendered homepage.
- Reframed tools as standalone vending-machine slots.
- Removed visible external links from navbar, footer, and settings project copy.
- Updated defaults in settings to internal utility routes.
- Removed the old lore-heavy homepage components and data from the active project structure.
- Made the privacy page self-contained with no external documentation or contact links.
- Rewrote README and CODEX workflow notes for Chestnut-24 as an independent project.

### Validation Notes

Validation should include:

- `npm.cmd run build`
- route smoke tests for `/`, `/utils`, `/settings`
- quick scan for unintended visible external links in top-level UI
