# Lightweight Character Motion Experiment

Branch: `live2d`

## Question

Can the dialogue stage animate AI-generated character art on computing-limited
devices without requiring a separate CG for every expression?

## Findings

### Cubism Web

The official Cubism Web runtime is a practical renderer after a model exists,
but it does not turn a flat generated image into a model. Cubism imports a PSD
whose character parts have already been separated, creates an ArtMesh for each
part, and requires deformation and motion authoring in Cubism Editor. The web
runtime then loads the exported `.model3.json`, `.moc3`, textures, motions, and
expressions.

AI generation can supply the source illustration, but a Cubism path still needs
layer separation and rigging. It also adds a proprietary Core runtime and a
publication-license review before release.

Sources:

- https://docs.live2d.com/en/cubism-editor-manual/psd-import/
- https://docs.live2d.com/en/cubism-editor-tutorials/import/
- https://docs.live2d.com/en/cubism-sdk-manual/use-framework-web/
- https://github.com/Live2D/CubismWebFramework
- https://www.live2d.com/en/sdk/license/

### Pixi Live2D Display

`pixi-live2d-display` reduces integration work and supports Cubism 2 and 4 model
files, but it is an unofficial wrapper around the same exported Live2D assets.
It does not remove the PSD separation and rigging step.

Source: https://github.com/guansss/pixi-live2d-display

### Single-Image Neural Animation

Talking Head Anime 3 can animate one transparent 512 x 512 upright anime
character, which is close to the desired content pipeline. Its own documentation
requires PyTorch with CUDA and a recent powerful Nvidia GPU. LivePortrait also
uses PyTorch, pretrained weights, and GPU-oriented inference. Both are better
suited to an offline asset-production service or an optional server renderer
than to this site's constrained client runtime.

Sources:

- https://github.com/pkhungurn/talking-head-anime-3-demo
- https://github.com/KlingAIResearch/LivePortrait

## Branch Prototype

`LayeredCharacterPuppet` is the single renderer for every character. It draws the
current expression image as three masked planes bound to a
lower-body / torso / head hierarchy:

- the expression images already in the repo; no new art, no per-frame CGs;
- no canvas, WebGL, WASM, neural weights, or new package dependency;
- breathing and pointer-driven head motion through compositor transforms only;
- pointer updates throttled through `requestAnimationFrame` and eased, so a fast
  cursor cannot snap the neck;
- no idle JavaScript loop; the browser owns the breathing animation;
- the existing still-image renderer stays the default; the puppet is opt-in from
  the dialogue settings panel and falls back to the still renderer whenever the
  device, the user's motion preference, or the image load says no.

This is not presented as real Cubism. It measures how much presence the site can
gain before accepting Cubism's authoring and licensing costs.

### Plane Masks And Joints

The joint geometry per character lives in `lib/puppetRigs.js` as percentages of
the rendered sprite height, measured off the artwork rather than guessed. A
character with no entry there has no puppet at all, and its motion toggle is
hidden.

Two properties make the decomposition hold together:

**Complementary alpha masks, not hard clips.** Each plane is cut with a
`linear-gradient` mask, and the ramps are complementary — wherever the head plane
fades out, the torso plane beneath it has already faded in. At rest the three
planes recompose the source image exactly, with no visible seam and no
double-drawn band. Hard `clip-path` edges cannot do this: they tear the moment a
joint moves, which is what forces clipped rigs to use amplitudes too small to
see.

**Pivots inside the blend bands.** Each plane rotates about a pivot placed in the
middle of its blend band. Rotation produces zero displacement at the pivot and
grows with distance from it, so the crossfade region sees almost no relative
motion while the visible swing happens out at the top of the head, where there is
no plane underneath to ghost against. Translation is deliberately kept small,
because unlike rotation it displaces the joint too.

Amplitudes are expressed as fractions of the measured character height, published
by the component as `--puppet-h`, so the rig reads the same on a narrow stage and
a wide one instead of being tuned for one viewport.

### Renderer Toggle and Fallback

`CharacterDisplay` exposes a "character motion" on/off setting in the shortcuts
panel, persisted per device in `localStorage` under `chestnut-character-motion`.
It is off by default, and the toggle only appears for characters that actually
have a puppet.

The still renderer is never removed from the component, so every path that is
not an explicitly enabled, working puppet lands on artwork that is known to
work. Characters with no puppet, coarse pointers, reduced-motion users, low-core
devices, and any puppet image that fails to load all render the plain expression
image and keep the expression crossfade.

### What The Rig Does And Does Not Do

The three planes give posture: the character breathes, and the head leads the
cursor and settles back. Every plane draws the same expression image, so a change
of expression is still a change of source art, exactly as before.

The rig deliberately does **not** synthesise facial features. An earlier version
painted CSS ellipses over the art for eyelids, pupils, and a mouth; measured
against the actual illustrations those landed on the cheeks and chin, because
hardcoded percentages cannot track where a given character's features sit. Eyes,
mouth, hands, coat, and hair tails need real source-layer separation with clean
artwork hidden under each moving joint — not overlays guessed in CSS.

The stage exposes `data-puppet-runtime="layered-bone-css"` so browser tests can
distinguish the rig from the still-image fallback.

Measured on the 1440x900 production build, with the character rendered 741px
tall: breathing moves the torso ~6.4px, and a full-width pointer sweep moves the
head ~20px horizontally and ~47px vertically. The predecessor rig moved ~2px,
which is why it read as static.

## Recommended Pipeline

1. Prefer an existing approved neutral transparent portrait when one is already
   available; generate a replacement only when the source cannot be rigged.
2. Use this branch's compositor puppet as the default low-resource renderer.
3. For important characters, separate the same approved art into a layered PSD,
   rig it once in Cubism Editor, and export a `.model3.json` package.
4. Add a lazy Cubism adapter that activates only when a model package exists and
   the device passes a performance check.
5. Keep the compositor puppet as the reduced-motion and low-memory fallback.

This hybrid path reduces expression-CG production immediately without claiming
that AI generation has eliminated rigging.
