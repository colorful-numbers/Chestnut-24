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

The branch uses `LightweightCharacterPuppet` as an intentionally small baseline:

- one neutral transparent PNG per character;
- no canvas, WebGL, WASM, neural weights, or new package dependency;
- breathing and mood changes through compositor transforms and filters;
- pointer gaze updates throttled through `requestAnimationFrame`;
- pointer tracking disabled for coarse pointers and reduced-motion users;
- no idle JavaScript loop; the browser owns the CSS animation;
- the existing still-image renderer remains in `CharacterDisplay` behind a
  feature constant for direct comparison.

This is not presented as real Cubism. It measures how much presence the site can
gain before accepting Cubism's authoring and licensing costs.

### Qi Layered Bone Prototype

Qi now has a second, character-specific prototype built from the existing
approved `expression-neutral.png`. The main CG was used to verify identity,
costume, and silhouette, but no new character art was generated: the transparent
neutral portrait already supplies a cleaner source than a regenerated copy.

`QiLayeredPuppet` draws the same source in three clipped, aligned planes:

- lower body, kept fixed as the root;
- torso, with a low-amplitude CSS breathing cycle;
- head and upper hair, with pointer-driven translation and rotation.

The planes form a simple root/torso/head hierarchy in one shared coordinate
system. Pointer updates are requestAnimationFrame-throttled, coarse pointers do
not track, and reduced-motion removes both breathing and tracking. The dialogue
stage exposes `data-puppet-runtime="layered-bone-css"` so browser tests can
distinguish this path from the one-plane fallback.

This prototype does not provide independent eyes, mouth, hands, coat, or hair
tails. Those require real source-layer separation and clean hidden artwork under
each moving joint. The three-plane version establishes the rendering and input
contract before investing in that asset work.

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
