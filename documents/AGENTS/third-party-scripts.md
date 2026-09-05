# Third-party scripts

Read this guide before adding, removing, moving, or changing analytics, advertising, conversion, consent, chat, or other provider-owned code.

## Locations

```text
src/components/scripts/
├── SitewideHead.astro
├── SitewideBodyStart.astro
├── SitewideBodyEnd.astro
├── sitewide/
└── page/
```

If this structure does not exist, create it when the first provider script is introduced. Keep sitewide base tags in `sitewide/` and page-specific conversions in `page/`. Use one clearly named Astro component per supplied snippet or inseparable provider fragment.

## Literal snippets

Paste provider code as supplied. Add only Astro's `is:inline` directive to provider-owned `<script>` elements. Preserve all other code, attributes, comments, companion markup, placement, and order. Do not convert provider snippets to TypeScript, interpolate site configuration, or combine unrelated snippets.

Use a processed Astro script for project-owned DOM behaviour.

## Placement and order

- Render each `Sitewide*.astro` registry exactly once from `src/layouts/BaseLayout.astro`.
- Order imported sitewide components explicitly. Put consent defaults before tags and base tags before dependent calls.
- Put page-specific components through the matching `page-head-scripts`, `page-body-start-scripts`, or `page-body-end-scripts` layout slot.
- Import a page conversion only from the page or shared outcome layout that should fire it.
- Preserve provider bootstrap queues. Source order does not override an external script's `async` completion.

## Verification

Build the site and inspect representative HTML. Confirm literal snippet text, exact placement, one sitewide instance, intended route membership, required source order, CSP and consent behaviour, provider debug signals, and absence of duplicate conversion firing.
