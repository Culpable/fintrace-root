/**
 * Scroll-triggered reveal trigger.
 *
 * Adds `is-visible` the first time each `.eng-reveal` element enters the
 * viewport, then stops observing it - every element animates exactly once and
 * no observer keeps running after the entrance completes. All visual motion is
 * defined in `engine-network.css` (transform and opacity only), so this module
 * stays a pure trigger. Thresholds match the production React wrapper exactly:
 * the trigger fires slightly before the element is fully in view so the
 * animation is already moving as the user reaches it.
 */
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }
  },
  { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
)

for (const element of document.querySelectorAll('.eng-reveal')) observer.observe(element)

export {}
