# Progress Log

## 2026-06-25 Continued 4

### Definitions And Cyclic Carousel

Work completed in this round:

- Fixed the shared carousel to keep cloned edge cards for cyclic movement while restoring dot selectors.
- Kept carousel movement drag-based and removed left/right arrow controls.
- Changed side-story cards to render media images directly so cloned edge cards participate in loading and rendering.
- Added footer menu links for Colorful Numbers Lab, the old index page, documentation, and privacy.
- Added the `defn` navigation entry after the world tab.
- Created markdown-driven definitions under `data/definitions/`.
- Added the `/defn` page to list parsed world definitions.
- Added `components/DefinitionText.jsx` for inline bracketed definition links and hover summaries.
- Passed local definitions into the homepage hero, story carousel, and character dialogue text.
- Added documentation for creating definitions and using inline definition labels.

## 2026-06-25 Continued 3

### Carousel And Character Widgets

The homepage widgets were split into custom components for easier growth.

Work completed in this round:

- Created `components/StoryCarousel.jsx` for random side-story fragments.
- Updated the story carousel to use horizontal scroll snap with 80% width cards, following the CSS carousel direction from Chrome's carousel guidance.
- Added side-story `time` values and rendered time on each story card.
- Removed the hero side panel, current-time status panel, and SVG signal diagram from the homepage.
- Converted the hero to a full-width background-image section using `public/story-media/hero-sylph.png`.
- Created `components/CharacterDisplay.jsx` for a simple game-dialog-style character widget.
- Added the first character demo under `data/characters/qi/`, with media under `public/characters/qi/`.
- Added predefined Qi conversation choices about waking, the white blade, and walking toward the convenience store.
- Removed the visible character-card implementation note from site copy.

## 2026-06-25 Continued 2

### Visual Novel Direction

The site goal is now an interactive visual fictional novel rather than an archive or utility-adjacent site.

Work completed in this round:

- Renamed the site to `栗世界` in Chinese and `Set of Chestnut` in English.
- Revised `README.md` to describe the visual novel goal and side-story publishing flow.
- Added `data/sideStories/` for publishable side-story fragments.
- Added placeholder media under `public/story-media/` for fragment cards and character cards.
- Updated the homepage to randomly select at most five side-story fragments on refresh.
- Changed the fragment carousel into card-like media panels with lower-left text.
- Converted character cards into media-background cards for future generated artwork.
- Removed homepage animation utilities and old reveal/pulse/float animation styles.
- Removed the settings entry from the nav and replaced it with a light/dark theme toggle.
- Reworked i18n into a global provider so the language toggle updates the whole homepage.

## 2026-06-25 Continued

### Story Direction Correction

The homepage should introduce the owner's existing world outline instead of unrelated invented fragments.

Work completed in this round:

- Replaced generated story fragments with setting cards for the Miracle, Sylph Corridor, hibernation, forgetting profession, and silent cities.
- Reworked the character/thread section around Qi, Work 101, the clerk, and Qi's central choice.
- Converted the story-fragment area into an auto-advancing carousel instead of category tabs.
- Changed the hero diagram into a stratospheric balloon / Corridor network visual.
- Added Tailwind animation utilities for page entrance, carousel card entry, slow drift, and soft pulse.
- Shifted the homepage palette to monochrome black, white, gray, and low-saturation accents.
- Updated repo guidance to avoid adding unrelated story hooks to the rendered homepage.

## 2026-06-25

### User Correction

The homepage must be a storytelling site, not an information hub, tool-sharing page, or rendered development log.

Work completed in this round:

- Replaced info-site and tool-vending homepage copy with bilingual story archive copy.
- Removed the utility archive section from the rendered homepage.
- Removed implementation/status notices from the rendered homepage and kept this context in docs.
- Simplified the homepage navigation to story sections only.
- Fixed corrupted Chinese UI text in the locale switch and homepage content.
- Replaced rendered settings-page implementation notes with neutral project copy.
- Updated README and CODEX workflow notes to preserve the story-first rule.
- Added the external `AGENTS.md` guideline source as a root submodule.
- Moved project-specific agent notes and the round-end checklist under `docs/`.

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
