'use client'

import clsx from 'clsx'
import { useEffect, useRef } from 'react'

/**
 * Scroll-reveal wrapper for the “Chambers” concept.
 *
 * Observe the element once with IntersectionObserver and add `is-revealed`
 * when it enters the viewport, letting chambers.css run its dignified
 * fade-and-settle transition. Unobserve immediately after revealing so the
 * observer costs nothing for the rest of the session.
 */

/* Restrict the polymorphic tag to the handful of semantic elements the page
 * actually renders, keeping ref typing honest without generics overhead. */
type RevealTag = 'div' | 'section' | 'p' | 'span' | 'li' | 'h2' | 'h3' | 'figure' | 'blockquote' | 'header'

type RevealProps = {
  as?: RevealTag
  className?: string
  /** Stagger offset in milliseconds applied as a transition delay. */
  delay?: number
  children?: React.ReactNode
}

export default function Reveal({ as = 'div', className, delay = 0, children }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    /* Reveal slightly before the element is fully in view so the settle
     * completes as the reader’s eye arrives, never after. */
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /* Cast the dynamic tag to 'div' purely to satisfy JSX ref variance; the
   * real element rendered at runtime is whatever `as` specifies. */
  const Tag = as as 'div'

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={clsx('ch-reveal', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
