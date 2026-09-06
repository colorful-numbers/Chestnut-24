// Bone layout for the layered character puppet, measured off the approved
// expression art (see docs/LIVE2D_EXPERIMENT.md). Every value is a percentage of
// the rendered sprite height, which the rig box matches exactly, so the numbers
// read straight off the artwork.
//
// `neck` and `waist` are the two joint lines. `neckBlend` / `waistBlend` are how
// far the plane masks feather either side of a joint: the planes are cut so that
// their alpha adds back up to a solid image at rest, and the feather is what
// turns a joint into a soft bend instead of a torn edge once it moves.
//
// A character with no entry here has no puppet: the dialogue stage renders the
// plain expression images and hides the motion toggle.
export const PUPPET_RIGS = {
  // Chin ~31%, shoulders from ~36%, obi and hips ~64-72%. Long hair runs past
  // the waist, so the neck feather is kept wide to smear rather than shear it.
  qi: {
    neck: 34,
    neckBlend: 9,
    waist: 68,
    waistBlend: 11,
    breathe: '6.4s',
  },
  // Chin ~33% with a raised hand just under it, collar ~41%, belt ~72-76%. The
  // neck joint sits above the hand so the hand stays with the torso.
  artifact101: {
    neck: 35,
    neckBlend: 8,
    waist: 74,
    waistBlend: 10,
    breathe: '5.6s',
  },
}

// Rotation pivots, placed in the middle of each blend band.
//
// This is what keeps the joints clean. A plane rotating about a pivot has zero
// displacement at that pivot and more the further away you look, so putting the
// pivot inside the band where two planes crossfade means the crossfade sees
// almost no relative motion — the visible swing all happens out at the top of
// the head, where there is no plane underneath to ghost against. Translation is
// kept small for the same reason: unlike rotation it shifts the joint too.
export function pivots({ neck, neckBlend, waist, waistBlend }) {
  return {
    neck: neck + neckBlend / 2,
    waist: waist + waistBlend / 2,
  }
}

// The three plane masks for a rig. Read top-down, the alpha ramps are
// complementary: wherever one plane fades out the plane beneath it is already
// fully opaque, so the composite is exactly the original image at rest and never
// shows a translucent seam.
export function maskLayers({ neck, neckBlend, waist, waistBlend }) {
  return {
    head: `linear-gradient(to bottom, #000 0%, #000 ${neck}%, transparent ${neck + neckBlend}%)`,
    torso: `linear-gradient(to bottom, transparent ${neck - neckBlend}%, #000 ${neck}%, #000 ${waist}%, transparent ${waist + waistBlend}%)`,
    lower: `linear-gradient(to bottom, transparent ${waist - waistBlend}%, #000 ${waist}%)`,
  }
}
