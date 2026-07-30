export const NICK_TESTIMONIAL = {
  eyebrow: 'In the client’s words',
  paragraphs: [
    'FinTrace saved me weeks I would otherwise have spent reading bank statements line by line, freeing me to focus on the work that genuinely needed my expertise.',
    'It linked every finding to the exact source page, allowing me to verify the analysis without having to repeat the work myself.',
  ],
  name: 'Nick Brookes',
  role: 'Lawyer · HFM Legal',
} as const

/**
 * The two approved paragraphs are split across the site so no sentence appears
 * in two visible copy blocks. About carries the weeks saved, which answers the
 * hours in its recent-matter section; the homepage carries the source-page
 * check, which answers its outcome plate's "a human can verify" note. Both
 * slices read from the single approved wording above, so a copy revision there
 * reaches every surface.
 */
export const TESTIMONIAL_TIME_SAVED = [NICK_TESTIMONIAL.paragraphs[0]] as const
export const TESTIMONIAL_SOURCE_CHECK = [NICK_TESTIMONIAL.paragraphs[1]] as const
