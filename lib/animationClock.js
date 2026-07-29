export function createAnimationClock(
  element,
  {
    property,
    enterDuration,
    exitDuration,
    initialValue = 0,
  },
) {
  let frame = 0
  let progress = initialValue
  let target = initialValue
  let lastTime = 0

  element.style.setProperty(property, progress.toFixed(4))

  const animate = (time) => {
    frame = 0
    const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16
    const duration = target > progress ? enterDuration : exitDuration
    const distance = target - progress
    const step = elapsed / duration

    lastTime = time
    progress = Math.abs(distance) <= step
      ? target
      : progress + Math.sign(distance) * step
    element.style.setProperty(property, progress.toFixed(4))

    if (progress !== target) {
      frame = window.requestAnimationFrame(animate)
    } else {
      lastTime = 0
    }
  }

  return {
    setTarget(nextTarget) {
      if (target === nextTarget && (frame || progress === nextTarget)) return
      target = nextTarget
      if (!frame) {
        lastTime = 0
        frame = window.requestAnimationFrame(animate)
      }
    },
    destroy() {
      if (frame) window.cancelAnimationFrame(frame)
    },
  }
}
