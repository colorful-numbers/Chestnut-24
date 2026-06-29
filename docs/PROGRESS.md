# Progress Log

## 2026-06-28 Continued 3

### Character Display: Responsive, Themed, Animated

- **Wide-screen layout.** Introduced a `--dialog-width` / `--dialog-margin` pair
  on `.character-stage`; the dialogue window, controls, and choices now all align
  to the same centred band at any width (no more controls/choices drifting to the
  viewport edges on ultrawide screens), and the band widens to `min(78%, 1100px)`.
- **Theming.** The character display read hardcoded dark colours. Added
  theme-aware `--stage-*` variables on `.character-stage` with `.light` overrides,
  and switched the dialogue window, controls, choices, tooltips, and backlog to
  them, so the widget follows the light/dark toggle (correct panel/text colours in
  light mode).
- **Scene crossfade.** The previous background is now an `<img>` layer that stays
  opaque while the incoming scene fades in over it (720ms ease-in-out dissolve).
- **Expression animation.** Sprites render through prev/next layers: on a switch
  the outgoing sprite lifts up and fades out while the incoming one settles down
  into place (`spriteSwapIn/Out`). Honors `prefers-reduced-motion`.
- **EMPTY sprite tag.** `lib/characters.js` now resolves expression markers at
  parse time and supports `![x](EMPTY)` and `- [expression](EMPTY)`, which set a
  shared `EMPTY` sentinel; `CharacterDisplay` renders no sprite until the next
  switch.

## 2026-06-28 Continued 2

### Expression Sprite Sizing

- The expression sprites were given real transparency with an external tool, so
  the in-app canvas keying was removed. `CharacterDisplay` renders the per-line
  expression as a plain `<img>` again.
- The stage sprite (`.character-stage__sprite`) is styled to occupy 5/6 of the
  stage height, centred horizontally and anchored to the bottom with
  `object-fit: contain`, so the scene background shows behind the character.

## 2026-06-28 Continued

### Markdown-Authored Character Dialogue

Replaced the per-character JS graph + JSON locale files with a single markdown
file per language, driven by a new format the owner proposed.

- Added `lib/characters.js` — parses a character markdown file into the
  `{ graph, lines }` shape `CharacterDisplay` consumes. Format:
  - Frontmatter: `title`, `speaker`, `defaultExpression`, `defaultBGM`,
    `starterNode`, `defaultNode` (node names matched case-insensitively).
  - `# H1` body = character blurb; `## H2` = scene with `- [BG](file)` /
    `- [BGM](name)`; `### H3` = dialogue node (id = heading).
  - Each non-empty line under a node is one displayed sentence; `![x](expr.png)`
    switches the sprite for following lines; a mid-node `- [BGM](name)` changes
    the running track and persists.
  - Choices: `- [Label](#node) 0.3` (weighted; default weight 1, normalized by
    weighted sum). `- [SKIP](#node)` jumps with no button and fires if sampled
    into the buffer of three. No choices → fall through to `defaultNode`; an
    unknown target → treated as a skip to `defaultNode`.
- Reworked `data/characters/index.js` into the global config + loader: the BGM
  track table, per-locale track display names, shared UI chrome strings, and
  `getCharacters()` (scans `data/characters/*`, parses `{zh,en}.md`,
  auto-discovers `bg-*` / `expression-*` / `*main-cg*` media in
  `public/characters/<id>/`, and JSON-sanitizes for `getStaticProps`). Removed
  every per-character `index.js`, `zh.json`, and `en.json`.
- `CharacterDisplay.jsx` now reads the graph/defaults from the active locale
  (`copy.graph`, `copy.starterNode`, `copy.defaultBackground/defaultBgm`), shows
  the per-line expression sprite, and auto-advances when a SKIP is sampled.
- Pages (`index.js`, `cast/index.js`, `cast/[id].js`) now receive characters via
  `getCharacters()` in `getStaticProps`/`getStaticPaths` (the loader is fs-based
  and server-only).
- Generated `data/characters/qi/zh.md` as the reference example and copied Qi's
  backgrounds into `public/characters/qi/` as `bg-*.png`. `artifact101/zh.md` is
  the owner's uploaded test conversation.

Open follow-up: `artifact101` references expression sprites
(`expression-happy.png`, etc.) that are not in `public/characters/artifact101/`
yet, so those frames fall back to the cast still until the art is added. (Note a
typo in that test file: `expression-focusd.png`.)

## 2026-06-28

### EN Maintenance, List-Based Dialogue, Weighted Choices, And Markdown Content

Work completed in this round:

- Disabled the English locale and labelled it as under maintenance. `lib/i18n.js`
  now exports `MAINTENANCE_LOCALES`/`isLocaleAvailable`; `normalizeLocale` blocks
  maintenance locales (saved `en` falls back to `zh`), and the navbar EN button is
  disabled with a hover "维护中" label (`nav.maintenance` copy + a `[disabled]`
  style on `.language-switch`).
- Split the inline `artifact101` character out of `data/characters/index.js` into
  its own `data/characters/artifact101/{index.js,zh.json,en.json}` folder, matching
  the Qi structure. `index.js` now just composes `qiCharacter` and `artifact101Character`.
- Rewired dialogue so each line's `text` is a **list of sentences** shown one at a
  time. The story graph was re-segmented: each node now groups a run of sentences
  and ends with either a weighted `choices` decision or a `next` scene/bgm change
  (e.g. Qi's `wake-1/2/3` collapsed into one `wake` node). Migrated both characters'
  zh/en JSON to the array format.
- Reworked `components/CharacterDisplay.jsx` around a `(node, lineIndex)` cursor:
  history, backlog, "back to last sentence/choice", auto-play, and skip-to-choice
  all step sentence-by-sentence and cross node transitions.
- Implemented Markov-style weighted choices. Choices carry a `weight` (distribution
  sums to 1); a node may hold more than three. The display samples three by weight
  when there are more than three, and shows all when there are three or fewer
  (`sampleWeightedIndices`, re-rolled per node visit).
- Converted definitions and side stories from JS/single-file content to per-language
  markdown folders: `data/definitions/<slug>/{zh,en}.md` and
  `data/sideStories/<id>/{zh,en}.md`. Frontmatter holds extra attributes (aliases,
  time, media, order, kicker); bodies hold localized prose. Added `lib/markdown.js`
  (shared frontmatter parser), `lib/sideStories.js`, and made `lib/definitions.js`
  locale-aware. `DefinitionText`, the `/defn` page, and the fragments pages/homepage
  now render the correct language; definition lookup is language-neutral so both
  `【奇迹】` and `【Miracle】` resolve.

### Validation Notes

- `npm run build` passes; all 34 pages prerender, including `/cast/{qi,artifact101}`
  and the five `/fragments/*` paths. Spot-checked that definition, fragment, and
  dialogue text appear in the generated HTML.

## 2026-06-27 Continued

### Artifact101 Rename And Apple Music Embeds

Work completed in this round:

- Renamed the secondary character from `work101` to `artifact101` across code: the variable, `id`, graph node ids (`work101-1/2` → `artifact101-1/2`) and their line keys, the asset folder (`public/characters/work101/` → `public/characters/artifact101/`), and media paths.
- Fixed the stale English name "Work 101" → "Artifact 101" in the character data and the homepage cast card copy.
- Switched BGM from local `.m4a` files to Apple Music embeds. `BgmPlayer` now expands to a panel holding the Apple Music `<iframe>` (with its own play/pause/scrub controls) instead of a custom audio element, note icon, and volume slider. The iframe stays mounted while collapsed so playback persists. Cross-origin embeds only play once deployed; that is acceptable for local preview.
- Test tracks: `Kimi ga Umareta Hi (feat. Hatsune Miku)` (default / main) and `Nuit` (the convenience-store scene). Removed the now-unused `public/story-media/bgm/` folder.

## 2026-06-27

### Galgame Character Display, BGM, And Routing Fixes

Work completed in this round:

- Fixed carousel cards not routing on click: the carousel now captures the pointer only after a real drag begins, so a plain tap stays a native link click and navigates to `/fragments/[id]` or `/cast/[id]`.
- Added a top-to-bottom title reveal animation (`titleFadeDown`) for hero, post, and card titles, with a reduced-motion opt-out.
- Restructured character data into a language-neutral story `graph` plus per-locale text `lines`. Most nodes are plain sentence nodes (`next`); decision nodes carry two or more `choices`. Roughly 80% of nodes are continue-only sentences.
- Rewrote `components/CharacterDisplay.jsx`:
  - Opens as a full-window modal occupying everything except the navbar.
  - Back button is embedded in the upper-left of the stage (passed via `backHref`).
  - Six tooltip-labelled controls: back to last choice, back to last sentence, backlog, auto play, next sentence, next choice.
  - Auto play and "next sentence"/"next choice" only advance sentence nodes and pause on decision/end nodes.
  - Added a galgame-style backlog panel to review visited lines and jump back to any of them.
  - Scene background changes crossfade via a previous/next layer (`sceneFade`); `background` and `bgm` are read from the active node and carried forward along the visited path.
- Added `components/BgmPlayer.jsx`: a corner circle button that expands into a widget with a play/pause note icon and a volume slider, collapses on outside click, and crossfades when the scene track changes. Playback uses an `<audio>` element (an Apple Music iframe embed cannot be controlled cross-origin). Audio files are expected under `public/story-media/bgm/`; the default track references *Kimi ga Umareta Hi (feat. Hatsune Miku)*.
- `/cast/[id]` now renders the display fullscreen with `autoOpen` and an embedded back link; the visible heading was replaced with a visually-hidden `h1` for SEO.
- Localization policy change: Chinese (`zh`) is authored fully; English (`en`) uses placeholders until reviewed. The new character `en.json` and the `work101` `en` lines are placeholders.

### Asset Notes

- Demo scene backgrounds reuse existing `public/story-media/*` art. Replace with dedicated CGs when ready.
- Drop real audio files at `public/story-media/bgm/kimi-ga-umareta-hi.m4a` and `silent-city.m4a` to hear BGM; controls function without them.

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
