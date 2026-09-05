/**
 * Crawler-facing site identity.
 *
 * Ported verbatim from the production Next build's `src/lib/metadata.ts`
 * (`siteMetadata`) so every emitted value stays byte-identical, with one
 * recorded exception: `openGraphLocale` corrects the published `en-AU` to the
 * `language_TERRITORY` form the Open Graph protocol requires (plan D-12).
 * `<html lang>` and the JSON-LD `inLanguage` keep the BCP 47 `en-AU` tag.
 */
export const site = {
  name: 'FinTrace',
  title: 'FinTrace: forensic bank-statement analysis for legal teams',
  description:
    'FinTrace is an AI-assisted forensic bank-statement analysis service for legal teams, delivering a structured ledger and source-linked findings.',
  siteUrl: 'https://fintrace.com.au',
  ogImage: '/images/og/fintrace-og.png',
  ogImageAlt: 'FinTrace forensic bank-statement analysis for legal teams',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  /** BCP 47 tag for `<html lang>` and JSON-LD `inLanguage`. */
  language: 'en-AU',
  /** Open Graph `language_TERRITORY` locale (plan D-12). */
  openGraphLocale: 'en_AU',
  titleSeparator: ' | ',
} as const
