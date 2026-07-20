'use client'

import { useEffect, useRef, useState } from 'react'

type RevealProps = {
  /** Element type to render; defaults to a plain div. */
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  /** Inline styles, e.g. scoped CSS custom properties or border colours. */
  style?: React.CSSProperties
  children: React.ReactNode
  /** Fraction of the element that must be visible before triggering. */
  threshold?: number
}

/**
 * Generic scroll-reveal wrapper.
 *
 * Set data-inview="true" on the rendered element the first time it
 * enters the viewport, then disconnect. All actual motion lives in
 * clarity.css (rules like `[data-inview='true'] .cl-reveal`), so this
 * component stays a tiny, reusable trigger with zero per-frame work.
 */
export default function Reveal({ as: Tag = 'div', className, style, children, threshold = 0.22 }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Observe once: reveals must not re-fire while the reviewer scrolls
    // back and forth comparing sections.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  // Cast is required because the polymorphic ref cannot be narrowed per tag.
  const ElementTag = Tag as React.ElementType

  return (
    <ElementTag ref={ref} className={className} style={style} data-inview={inView ? 'true' : 'false'}>
      {children}
    </ElementTag>
  )
}
