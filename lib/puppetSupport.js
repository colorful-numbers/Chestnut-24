// Capability gate for the experimental character puppets (see
// docs/LIVE2D_EXPERIMENT.md). The dialogue stage calls this before mounting any
// puppet, so every "no" lands on the original still-image renderer rather than
// on a rig that would sit motionless or stutter.
//
// Client-only: it reads matchMedia and navigator, and returns false during SSR
// so the first paint is always the still art.
export function supportsPuppet() {
  if (typeof window === 'undefined') return false
  if (!window.PointerEvent || !window.requestAnimationFrame) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (window.matchMedia('(pointer: coarse)').matches) return false
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return false
  return window.CSS?.supports?.('transform', 'translate3d(0, 0, 0)') ?? false
}
