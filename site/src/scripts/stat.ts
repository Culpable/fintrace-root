/**
 * Animated numeral for the proof plate.
 *
 * Counts from `data-stat-from` to `data-stat-to` the first time the numeral is
 * properly on screen, then never re-runs. The starting value is prerendered so
 * the static HTML is real content; the animation is a `requestAnimationFrame`
 * loop with an ease-out quartic curve - fast movement early, a slow settle.
 */
function mountStat(element: HTMLElement): void {
  const from = Number(element.dataset.statFrom ?? 0)
  const to = Number(element.dataset.statTo ?? 0)
  const duration = Number(element.dataset.statDuration ?? 1800)
  const prefix = element.dataset.statPrefix ?? ''
  const suffix = element.dataset.statSuffix ?? ''
  let rafId = 0

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      observer.disconnect()
      const startedAt = performance.now()

      const tick = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / duration)
        // Ease-out quartic: fast movement early, a slow satisfying settle.
        const eased = 1 - Math.pow(1 - progress, 4)
        element.textContent = `${prefix}${Math.round(from + (to - from) * eased)}${suffix}`
        if (progress < 1) rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    },
    { threshold: 0.6 },
  )
  observer.observe(element)

  window.addEventListener('pagehide', () => {
    observer.disconnect()
    cancelAnimationFrame(rafId)
  })
}

for (const element of document.querySelectorAll<HTMLElement>('[data-stat-to]')) mountStat(element)

export {}
