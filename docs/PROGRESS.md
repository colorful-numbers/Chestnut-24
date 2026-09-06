# Progress Log

## 2026-09-06

### Live2D Branch Merge And Motion Toggle

Merged the two diverged `live2d` lines. The redesign line (spatial homepage
corridors, layered hero, archive timeline) was kept as the current content; from
the older line only the genuinely new work was carried over, namely the Qi
layered bone rig. The remote line's earlier homepage and copy revisions were
superseded rather than reapplied.

The puppets are no longer the unconditional renderer. `CharacterDisplay` keeps
the original still-image renderer and its expression crossfade as the default,
and mounts a puppet only when one exists for the character, the reader has
switched motion on, and the device gate passes:

- `PUPPET_BY_CHARACTER` maps a character id to its renderer, so characters
  without one never show the setting and never leave the still path.
- A "立绘动态（实验）" on/off control sits in the dialogue shortcuts panel and is
  saved per device under `chestnut-character-motion`. It is off by default.
- `lib/puppetSupport.js` holds the shared capability gate (pointer events,
  reduced motion, coarse pointer, core count, transform support). Both puppets
  use it, and both report back through `onUnavailable` so a failed gate or a
  broken image swaps the still renderer back in instead of stalling.

The Qi rig CSS moved into `styles/live2d-experiment.css` to match this line's
split stylesheet layout.

Verified with a production build and a CDP-driven browser pass over `/cast/qi`
and `/cast/artifact101`: still art by default, `layered-bone-css` and
`artifact101-stage1-css` after enabling motion, still art again after disabling,
the preference surviving a reload, and the still renderer under both
reduced-motion and coarse-pointer emulation with no horizontal overflow at
390×844.

Touched files: `components/CharacterDisplay.jsx`,
`components/LightweightCharacterPuppet.jsx`, `components/QiLayeredPuppet.jsx`,
`lib/puppetSupport.js`, `data/characters/index.js`,
`styles/live2d-experiment.css`, `docs/LIVE2D_EXPERIMENT.md`, and this log.

## 2026-07-19

### Scroll Journey And Archive Consistency

Corrected the interaction failures found during live review without rewriting
story, character, or definition copy.

- Rebuilt the hero's first frame around the complete original composition. A
  visible eager-loaded source image now remains in place until all three aligned
  parallax planes have loaded, preventing a blank or partially decoded opening.
- Added aligned layer overscan and cover framing so scroll and pointer movement
  cannot expose the hero container or lift the image edge above its clipping
  boundary on desktop or mobile.
- Removed the two hero orbit circles and their vertical red progress guide.
- Removed the reduced-motion early return that had disabled the hero effect.
  Scroll now drives the background, balloon, foreground, and copy planes at
  distinct rates; pointer movement remains gentler when reduced motion is set.
- Unified `/cast`, `/defn`, and `/fragments` under one light, hard-edged archive
  system with matching spacing, type scale, card geometry, and mobile columns.
- Removed the requested fragment helper paragraph from rendered markup and
  locale data. The equivalent archive-introduction paragraphs were also removed
  from the Cast and Definitions headings without changing their source copy.
- Replaced random entry delays with deterministic scroll reveals. Archive cards
  now reveal by viewport row, and supporting accent lines draw as cards enter.
- Verified a clean production build, all four primary routes at HTTP 200, no
  horizontal overflow at an emulated 390-by-844 viewport, full hero-layer loads,
  measurable layer separation after scrolling, and viewport-triggered card
  reveals on `/fragments`.

### Light Surface And Physical Hero Layers

Corrected the homepage after review showed that its structural surfaces still
read as a dark theme and that clipped copies of one hero image did not create
convincing depth.

- Regenerated the existing hero artwork as three aligned 1536×1024 planes:
  distant sky/city, transparent balloon structures, and transparent foreground
  architecture/vegetation. No new scene or story element was introduced.
- Rewired hero scroll and pointer transforms to move the three physical planes
  at distinct speeds, with the foreground and balloon layers traveling farther
  than the reconstructed background.
- Converted the homepage navigation, character gateway, story carousel section,
  mobile menu, and footer to light surfaces with corrected ink/muted text colors.
  Dark values remain only inside artwork overlays and primary action controls.
- Added one-line curiosity hooks to character, world, and fragment cards. The
  hooks use clipped scroll reveals and small hover shifts to invite interaction
  without summarizing the underlying story or character dialogue.
- Verified the homepage at desktop and 390×844 mobile widths: all three layers
  load, the mobile menu remains full height, no horizontal overflow appears, and
  the browser console is clean.

### Responsive Interaction And Light-Only Pass

Reworked the current game-show UI around reliable mobile navigation, visible
media, and scene-driven motion without changing story canon or source artwork.

- Replaced the cramped mobile dropdown with a full-height, scroll-locked route
  menu using large touch targets, clear numbering, Escape handling, and route
  close behavior.
- Corrected phone layouts to use the supplied media's landscape proportions and
  `object-fit: contain`, keeping hero, character, definition, and fragment art
  complete at narrow widths with no horizontal overflow.
- Expanded the homepage hero into working multi-layer scroll and pointer
  parallax. Sky, settlement, land, atmospheric geometry, and copy now move at
  different rates with reduced-motion support.
- Replaced the old page-wide cursor spotlight and per-card sheen with a subtle
  cursor-responsive Sylph network field made from drifting nodes, orbit lines,
  and a parallax grid. Story, world, and post media also receive scroll-linked
  depth motion on larger viewports.
- Removed the theme switch, `next-themes`, dark/system selection logic, dimming
  sampler, and unused dark utility variants. The document now runs in an
  explicit light color scheme while intentional dark story sections remain.
- Split the oversized site stylesheet into core, homepage, content, list,
  dialogue, and effects modules, with `world-archive.css` retained as the import
  entry point.

## 2026-07-17

### Canon And Hero Correction

This correction supersedes the rejected layered-surface experiment below.
The user clarified that philosophical premises supplied for design reasoning are
not names, labels, dates, events, or definitions in the fictional canon. Codex
(GPT-5) restored the original authored descriptions and removed all invented
terms, coordinates, timeline entries, numbered dossiers, and settlement-status
copy from the site.

The three generated hero layers were deleted. The homepage now uses the
project's existing `public/story-media/hero-sylph.png` exclusively. Four clipped
instances of that same artwork form sky, middle-distance, and foreground depth
bands, with requestAnimationFrame-throttled vertical parallax. This keeps the
established monochrome linework and the original segmented balloon design
coherent across the whole first viewport. Desktop and mobile crops were checked
in the browser; mobile is framed on an existing balloon and no horizontal
overflow is present.

Visible homepage prose was reduced to titles and direct actions. The generated
explanatory summaries, decorative labels, nav subtitle, section numbering, and
fake metadata were removed. Original descriptions remain available in the
source data and detail views.

Touched files: `components/CharacterGateway.jsx`,
`components/LayeredWorldHero.jsx`, `components/StoryCarousel.jsx`,
`components/WorldIndex.jsx`, `data/characters/qi/zh.md`,
`data/definitions/new-constitution/`, `data/sideStories/silent-city/zh.md`,
`data/siteContent.js`, `pages/cast/index.js`, `pages/index.js`,
`pages/navbar.js`, `styles/world-archive.css`, deleted experimental definitions,
deleted generated hero layers, and this progress log.

### Live2D Feasibility Branch

Created `live2d` from the deployable `codex/game-show-redesign` checkpoint
`4d2bb73`. Research found that Cubism Web is suitable only after a layered PSD
has been meshed and rigged, while single-image neural animation currently needs
GPU-oriented Python inference. The branch therefore adds a zero-dependency
compositor puppet to `CharacterDisplay`: one neutral transparent raster,
requestAnimationFrame-throttled gaze, CSS breathing, expression-derived mood
parameters, and reduced-motion/coarse-pointer fallbacks. The original still
renderer remains behind a feature constant for comparison. Full research and
the recommended hybrid asset pipeline are recorded in
`docs/LIVE2D_EXPERIMENT.md`.

Touched files on this branch: `components/LightweightCharacterPuppet.jsx`,
`components/CharacterDisplay.jsx`, `styles/world-archive.css`,
`docs/LIVE2D_EXPERIMENT.md`, and this progress log.

### Qi Layered Bone Pass

Codex (GPT-5) inspected Qi's main CG and existing transparent neutral portrait.
Because the approved neutral asset already matches the character and is suitable
for compositing, no replacement character art was generated. A new
`QiLayeredPuppet` renders that image as three aligned planes bound to a simple
lower-body/torso/head hierarchy. The head follows fine-pointer movement, the
torso breathes on the compositor, and coarse-pointer plus reduced-motion modes
stay static. Other characters continue to use the one-plane fallback.

Browser verification confirmed the `layered-bone-css` runtime, three active
planes using the approved local asset, independent head and torso transforms,
and no horizontal overflow at desktop or mobile sizes.

Touched files: `components/QiLayeredPuppet.jsx`,
`components/CharacterDisplay.jsx`, `styles/world-archive.css`,
`docs/LIVE2D_EXPERIMENT.md`, and this progress log.

### Rejected Layered Surface Experiment

An earlier pass generated three hero layers and promoted design assumptions into
new setting labels and rewritten story text. The user rejected that direction:
it changed canon, introduced unsupported visual details, and used excessive copy
instead of redesigning the interface. None of those generated assets, terms, or
text changes remain in the project. The correction above is the authoritative
record of the current implementation.

### Character-Led Game Showcase Redesign

User request: create a development branch from `main` and freely redesign the
Chinese-first site as a modern game showcase. The primary product message must
be unmistakable: visitors pre-explore the world setting through the characters
defined in the cast view. Text and media should work together, navigation should
be intuitive, and the visual direction may draw from the restraint of
NieR:Automata and the information architecture of Arknights: Endfield without
copying either project.

Work completed by Codex (GPT-5):

- Created `codex/game-show-redesign` from `main`, preserving the existing
  in-progress multi-chapter dialogue work in the working tree.
- Rebuilt the home hero around the direct Chinese message "先认识一个人，再进入
  她眼中的世界", with a recommended three-minute entry into 作品101's dialogue
  and a secondary path to choose another observer.
- Added an interactive observer gateway that switches between 作品101 and 器,
  pairing each character's media with her premise, central question, related
  world terms, and direct dialogue route.
- Added a visual world index and repositioned story fragments as recorded
  evidence from the setting, creating a clear sequence: observer, world terms,
  then archival fragments.
- Rebuilt the cast archive as large character dossiers and simplified the
  navigation/footer to internal discovery routes only. The mobile menu now
  reports its expanded state and controlled region.
- Introduced a monochrome, architectural game-show visual system with signal
  red and cyan status accents, hard-edged controls, responsive section layouts,
  and restrained motion. Existing monochrome character and fragment artwork is
  now used as primary narrative media instead of decoration.
- Generated `public/story-media/hero-gateway-v2.png` with the built-in image
  generation tool. Prompt summary: a 16:9 original monochrome anime
  science-fiction city after humanity moved into the stratosphere, immense
  flower-like weather-balloon computation stations, and an original black-haired
  female traveler on the right, with pale negative space on the left for Chinese
  interface copy; quiet overcast lighting, stone and industrial detail, tiny red
  signals, no text, logos, watermark, or recognizable copyrighted character.
- Verified the production build and tested the homepage, character switching,
  cast archive, mobile menu, desktop/mobile overflow, and browser diagnostics at
  desktop and 390 x 844 mobile viewports. Browser warnings/errors were empty.

Redesign files: `components/CharacterGateway.jsx`,
`components/WorldIndex.jsx`, `components/SiteEffects.jsx`,
`data/siteContent.js`, `pages/index.js`, `pages/cast/index.js`,
`pages/navbar.js`, `pages/footer.js`, `styles/world-archive.css`,
`public/story-media/hero-gateway-v2.png`, and this progress log.

### Multi-Chapter Dialogue Routing

User request: revisit the character dialogue, fix the reported hydration/SSR
warnings, and replace the one-file conversation limit with freely linked
markdown chapters whose route remains visible and navigable in the backlog.

Work completed by Codex (GPT-5):

- Fixed multi-node `<title>` rendering on content routes and removed the
  carousel's server-side `useLayoutEffect` warning.
- Added chapter discovery under `data/characters/<id>/<locale>/*.md`, while
  retaining the legacy `<locale>.md` loader.
- Namespaced dialogue nodes by chapter and added local `#node` plus cross-file
  `./chapter.md/#node` routing, including nested relative paths.
- Merged every locale's chapters into one graph so existing next/previous,
  choice, skip, and backlog controls work across file boundaries.
- Added chapter names to backlog entries and persisted the current position plus
  up to 1,000 history entries per character and locale in local storage.
- Migrated the in-progress `artifact101` split, corrected the lighthouse
  filename and cross-chapter ending links, and preserved the user's new park
  background asset.
- Updated character authoring docs and project guidance for the chapter format.
- Verified a production build, serialized graph targets, browser navigation from
  the library to the park, chapter-aware backlog display, reload persistence,
  and an empty browser warning/error log.

Touched files: `components/Carousel.jsx`, `components/CharacterDisplay.jsx`,
`data/characters/index.js`, `lib/characters.js`, all content under
`data/characters/artifact101/zh/`, `pages/cast/[id].js`, other content page title
components, `data/characters/README.md`, `docs/content/characters.md`,
`docs/AGENTS.md`, and this progress log.

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
