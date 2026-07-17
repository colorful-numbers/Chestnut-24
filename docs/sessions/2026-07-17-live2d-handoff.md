# Hero Correction And Qi Rig Handoff

Date: 2026-07-17
Model: Codex (GPT-5)
Primary branch: `live2d`

## User Direction Recorded

- Treat supplied philosophical assumptions as reasoning constraints, not canon
  labels, dates, coordinates, or named concepts.
- Remove invented copy, fake numbering, timeline entries, and the settlement
  status bar. Restore the original authored setting and character text.
- Reduce homepage prose and let imagery, motion, and direct navigation carry the
  information design.
- Do not use the generated hero buildings because they conflict with the
  project's established media and setting. Use existing approved work.
- Make hero perspective motion visible on vertical scroll and improve the sky
  framing.
- Keep Live2D-style work isolated on `live2d`. Start with Qi and use her main CG
  as the identity and style authority. Target constrained devices.
- Run the preview on port 3000, replacing any process already using that port.

## Result

`live2d` commits:

- `781a06b` restores canon and the original hero artwork.
- `faa64f6` adds the Qi layered bone experiment.

Deployable redesign branch:

- `codex/game-show-redesign` commit `489494a` carries only the canon and hero
  correction. It does not include the Qi rig.

The generated hero layers and invented definitions were deleted. The hero now
uses only `public/story-media/hero-sylph.png`; four clipped copies create the
base, sky, middle-distance, and foreground planes. Scroll transforms separate
those planes while reduced-motion users receive a static composition. Desktop
and mobile crops were checked against the original segmented balloon artwork.

Qi's existing approved transparent `expression-neutral.png` was suitable for a
first rig, so no replacement character image was generated. The browser renders
three aligned planes from that source and binds them to lower-body, torso, and
head transforms. Other characters retain the one-plane compositor fallback.

## Touched Files

- `components/CharacterDisplay.jsx`
- `components/CharacterGateway.jsx`
- `components/LayeredWorldHero.jsx`
- `components/QiLayeredPuppet.jsx`
- `components/StoryCarousel.jsx`
- `components/WorldIndex.jsx`
- `data/characters/qi/zh.md`
- `data/definitions/new-constitution/en.md`
- `data/definitions/new-constitution/zh.md`
- `data/sideStories/silent-city/zh.md`
- `data/siteContent.js`
- `docs/LIVE2D_EXPERIMENT.md`
- `docs/PROGRESS.md`
- `pages/cast/index.js`
- `pages/index.js`
- `pages/navbar.js`
- `styles/world-archive.css`

Deleted files:

- `data/definitions/surface-grid/en.md`
- `data/definitions/surface-grid/zh.md`
- `data/definitions/symmetric-freedom/en.md`
- `data/definitions/symmetric-freedom/zh.md`
- `public/story-media/hero-layer-land.png`
- `public/story-media/hero-layer-settlement.png`
- `public/story-media/hero-layer-sky.png`

## Verification

- `npm.cmd run build` passes all 17 generated routes.
- Homepage browser console has no warnings or errors.
- Hero media sources all resolve to the original `hero-sylph.png`.
- Rejected labels are absent from rendered homepage text.
- Desktop and 390 x 844 layouts have no horizontal overflow.
- Qi reports `data-puppet-runtime="layered-bone-css"` with three planes.
- Pointer movement produces independent head and torso transforms.
- Preview is running at `http://localhost:3000`.

## Working Tree And Recording

The pre-existing `package-lock.json` modification remains unstaged and was not
changed or reverted by this session.

PCP recording was not uploaded. The server returned `TOKEN_REVOKED` for the
session transcript route and instructed the user to generate a new access token
from the session detail page. No success claim should be made for that upload.
