/**
 * Ledger set-piece trigger.
 *
 * Fires the whole choreography once, when a third of the plate is seen. Every
 * subsequent frame is CSS keyframes on transform and opacity only.
 */
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-run')
        observer.disconnect()
      }
    }
  },
  { threshold: 0.3 },
)

const plate = document.querySelector('.eng-lt')
if (plate) observer.observe(plate)

export {}
