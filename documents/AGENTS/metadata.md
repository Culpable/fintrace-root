# Metadata

Read this guide before creating or changing a title, description, canonical, robots, Open Graph, Twitter, JSON-LD, feed, or metadata owner.

## Owners

- `src/config/site.ts` owns the site name, exact title separators, verified BCP 47 language, default social image, official profiles, identity, public contact, and address facts.
- Pages and content entries own route-specific titles, descriptions, and deliberate overrides.
- `src/lib/metadata.ts` validates inputs and composes document titles.
- `src/components/head/PageMetadata.astro` renders the authoritative head metadata.
- `src/lib/structured-data.ts` builds linked `WebSite`, `WebPage`, identity, and supported page-specific schema nodes.
- `src/components/head/StructuredData.astro` safely serializes the graph inside the same head system.
- `src/layouts/BaseLayout.astro` renders the metadata component exactly once.
- `astro.config.*` owns the canonical production origin through Astro's `site` setting.

The site name and exact title separator remain configuration-owned even as the same module gains readiness facts.

## Title composition

Every page supplies an uncomposed page title and lets the resolver apply the current site identity. Three modes, and each has exactly one job:

| `titleMode` | Rule | Example | Which routes |
| --- | --- | --- | --- |
| `composed` (default) | `page title + title separator + site name` | `Contact \| Example Site` | Every page except the home page |
| `prefixed` | `site name + title prefix separator + short descriptor` | `Example Site: Accountants in Leeds` | **The home page only** |
| `absolute` | the supplied title, verbatim | as written | A deliberate exact title, by exception |

The home page leads with the brand: it is the route that ranks for the brand name. Every other route keeps the suffix rule, so the page subject reads first. Do not put a second route on `prefixed`; two punctuation rules across internal pages read as an inconsistency, not a system.

`absolute` is the escape hatch, not the home-page default. It is the one mode a site-name change never reaches.

Keep both the semantic page title and resolved document title. Use the document title for HTML, Open Graph, and Twitter title output. Use the semantic title for the visible H1 when appropriate and for JSON-LD page names or article headlines.

Do not store already composed titles in pages, Markdown, or CMS fields. Do not use a pathname registry as the default metadata source.

## Descriptions and canonicals

Require a route-specific description for every indexable page. Do not hide missing descriptions behind one generic sitewide fallback.

Default canonicals from the page path and resolve them against `Astro.site`. Use an override only for deliberate canonical consolidation. Do not emit preview, local, query, or fragment URLs as canonicals.

## Language, images, and structured identity

Render `<html lang>` from the verified site language. Resolve a route social image before the default. Every production-ready indexable route has one absolute image, non-empty alternative text, aligned Open Graph and Twitter values, and known dimensions and MIME type where available.

Emit truthful linked JSON-LD through `StructuredData.astro`. Include `sameAs`, contact, address, offers, author, price, ratings, and type-specific fields only from verified visible facts. An applicable Organization requires a verified ContactPoint with contact type and email or telephone plus a truthful PostalAddress. Missing required facts fail readiness; never invent them.

## Verification

Build representative routes and inspect generated HTML. Assert one title, description, canonical, `og:title`, `twitter:title`, language, `og:type`, image, and parsed JSON-LD graph where applicable. Test composed, prefixed, absolute, empty, already-suffixed, already-prefixed, image precedence, identity variants, graph links, profile omission, required Organization facts, and script-breaking values. Confirm a site-name or separator change updates composed and prefixed titles without page edits and leaves absolute titles unchanged. Confirm no route other than the home page uses `prefixed`.
