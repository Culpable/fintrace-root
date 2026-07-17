import type { Metadata } from 'next'

/** Keep internal comparison routes crawlable while directing search engines not to index, follow, or cache them. */
export const internalRobots: Metadata['robots'] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    nocache: true,
  },
}
